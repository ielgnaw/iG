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
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame =
              window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
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

    var exports = {};

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
    exports.STATUS = {
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
    };

    /**
     * 标准 fps
     *
     * @type {number}
     */
    exports.STANDARD_FPS = 60;

    /**
     * 利用 requestAnimationFrame 来循环
     *
     * @param {Object} opts 参数对象
     * @param {number} opts.fps fps
     * @param {Function} opts.exec 每帧执行的函数
     * @param {number} opts.ticksPerFrame 控制执行的速度
     *                                    如果帧数是 60fps，意味着每 1000 / 60 = 16ms 就执行一帧，
     *                                    如果设置为 3，那么就代表每 3 * 16 = 48ms 执行一次，帧数为 1000 / 48 = 20fps
     */
    exports.loop = function (opts) {
        var conf = util.extend(true, {}, {
            fps: exports.STANDARD_FPS,
            step: util.noop,
            render: util.noop,
            ticksPerFrame: 0
        }, opts);

        var requestId;
        var now;
        var then = Date.now();
        var tickUpdateCount = 0;
        var passed = 0;

        // 毫秒，固定的
        var dt = 1000 / exports.STANDARD_FPS;

        var acc = 0;

        (function tick() {
            requestId = window.requestAnimationFrame(tick);

            tickUpdateCount++;

            if (tickUpdateCount > conf.ticksPerFrame) {
                tickUpdateCount = 0;
                now = Date.now();
                passed = now - then;
                then = now;

                acc += passed; // 过去的时间的
                while (acc >= dt) { // 时间大于固定的 dt 才能更新
                    // 如果这里直接写成 conf.step(dt)，
                    // 那么在 sprite 的 step 里面需要写 this.vx * dt * (this.fps / 1000);
                    // 是因为 60 fps 即每秒 60 帧，每帧移动一个单位距离，那么每秒移动 60 个单位距离，那么每毫秒移动 60/1000 个单位距离
                    conf.step(dt * (exports.STANDARD_FPS / 1000)); // 分片更新时间

                    acc -= dt;
                }

                conf.render();
            }
        })();

    };

    return exports;

});
