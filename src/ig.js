/**
 * @file 主入口文件
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

    // requestAnimationFrame polyfill by Erik Möller
    // fixes from Paul Irish and Tino Zijdel
    (function () {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame
                = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    })();

    var util = require('./util');
    var config = require('./config');

    var exports = {};

    exports.setConfig = config.setConfig;

    exports.getConfig = config.getConfig;

    /**
     * displayObject 的各种状态
     *     1: 可见，每帧需要更新，各种状态都正常
     *     2: 不可见，每帧需要更新，各种状态都正常
     *     3: 可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
     *     4: 不可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
     *     5: 已经销毁（不可见），不需要更新，也不在整体的 DisplayObject 实例集合中了
     *
     * @type {Object}
     */
    exports.setConfig('status', {
        // 可见，每帧需要更新，各种状态都正常
        NORMAL: 1,
        // 不可见，每帧需要更新，各种状态都正常
        NOT_RENDER: 2,
        // 可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
        NOT_UPDATE: 3,
        // 不可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
        NOT_RU: 4,
        // 已经销毁（不可见），不需要更新，也不在整体的 DisplayObject 实例集合中了
        DESTROYED: 5
    });

    /**
     * 游戏窗口宽度的默认值
     *
     * @type {number}
     */
    // exports.setConfig('width', 320);
    // exports.setConfig('width', 414);
    exports.setConfig('width', 383);

    /**
     * 游戏窗口高度的默认值
     *
     * @type {number}
     */
    // exports.setConfig('height', 480);
    // exports.setConfig('height', 736);
    exports.setConfig('height', 550);

    /**
     * 游戏窗口最大宽度的默认值
     *
     * @type {number}
     */
    exports.setConfig('maxWidth', 5000);

    /**
     * 游戏窗口最大高度的默认值
     *
     * @type {number}
     */
    exports.setConfig('maxHeight', 5000);

    /**
     * 标准 fps
     *
     * @type {number}
     */
    exports.setConfig('fps', 60);

    /**
     * 利用 requestAnimationFrame 来循环
     *
     * @param {Object} opts 参数对象
     * @param {Function} opts.step 每帧中切分出来的每个时间片里执行的函数
     * @param {Function} opts.exec 每帧执行的函数
     * @param {number} opts.jumpFrames 跳帧的个数，可以用来设置延迟
     *                                 如果帧数是 60fps，意味着每 1000 / 60 = 16ms 就执行一帧，
     *                                 如果设置为 3，那么就代表每 3 * 16 = 48ms 执行一次，帧数为 1000 / 48 = 20fps
     */
    exports.loop = function (opts) {
        var conf = util.extend(true, {}, {
            step: util.noop,
            exec: util.noop,
            jumpFrames: 0
        }, opts);

        var fps = exports.getConfig('fps') || 60;
        // 毫秒，固定的时间片
        var dt = 1000 / fps;

        var requestID;

        var passed = 0;
        var frameUpdateCount = 0;
        var now;
        var then = Date.now();
        var acc = 0;

        // 每帧中切分出来的每个时间片里执行的函数的计数器
        var stepCount = 0;

        // 每帧执行的函数的计数器
        var execCount = 0;

        var _jumpFrames = (conf.jumpFrames === 0 ? 1 : conf.jumpFrames);

        (function tick() {
            requestID = window.requestAnimationFrame(tick);
            frameUpdateCount++;

            if (frameUpdateCount > conf.jumpFrames) {
                frameUpdateCount = 0;

                now = Date.now();
                passed = now - then;
                then = now;
                acc += passed; // 过去的时间的累积

                // 这里设置 passed <= 100ms 时才会执行
                // 100ms 意味着 fps = 10，即每秒才执行 10 帧动画，
                // 这里我们排除掉这么低的帧率，认为大部分 passed > 100ms 的情况是指切换页面了，
                // 切换到其他页面后， requestAnimationFrame 不会执行了，这时 while 循环里的内容实际上也不执行，但是回到动画页面时，
                // 由于 now 是回到动画页面的时间戳，而 then 是切换到其他页面那个时刻的时间戳，
                // 因此 now 和 then 的差值即 passed 会变得特别大，这就会导致 while 循环里面的内容会执行很多次，这是没有必要的
                // 所以这里用 passed <= 100 来限制这种情况，当 > 100 后，需要把 acc 还原为切换到其他页面那个时刻的值即减去 passed
                //
                // 这里还有可能出现一个问题，就是当 cancelAnimationFrame 时，那么不会执行下一次的 tick 了，但是当前这一次 tick 里的
                // while 循环还没有执行完成，所以会导致多执行，这个问题不在这里修改，在调用处修改
                // 例如 Animation.play 以及 Game._gameStartExec 的 ig.loop 初，
                // 同时在调用处 cancelAnimationFrame 时要把 requestID 设置为 null
                if (passed <= 100 * _jumpFrames) {
                    while (acc >= dt * _jumpFrames) { // 时间大于固定的 dt（每跳一帧会经过一个 dt）才能更新
                        stepCount++;
                        // 如果这里直接写成 conf.step(dt)，
                        // 那么在 sprite 的 step 里面需要写 this.vx * dt * (this.fps / 1000);
                        // 是因为 60 fps 即每秒 60 帧，每帧移动一个单位距离，那么每秒移动 60 个单位距离，
                        // 那么每毫秒移动 60/1000 个单位距离
                        conf.step(dt * (fps / 1000), stepCount, requestID); // 分片更新时间
                        acc -= dt * _jumpFrames;
                    }
                    execCount++;
                    conf.exec(execCount);
                }
                else {
                    acc -= passed;
                }
            }
        })();
    };

    return exports;

});
