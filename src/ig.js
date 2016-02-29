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

    /**
     * 挂载 config.setConfig
     *
     * @type {Function}
     */
    exports.setConfig = config.setConfig;

    /**
     * 挂载 config.getConfig
     *
     * @type {Function}
     */
    exports.getConfig = config.getConfig;

    /**
     * 利用 requestAnimationFrame 实现 setInterval 的功能
     *
     * @param {Function} fn 循环执行的函数
     * @param {number} delay 延迟时间间隔
     *
     * @return {Object} 带有 requestId 的对象
     */
    exports.rafInterval = function (fn, delay) {
        var start = util.getTimestamp();
        var handler = {};

        function loop() {
            var current = util.getTimestamp();
            var realDelta = current - start;

            if(realDelta >= delay) {
                fn.call(null, exports.getConfig('delta'), realDelta, 1000 / realDelta);
                start = util.getTimestamp();
            }

            handler.reqId = window.requestAnimationFrame(loop);
        }

        handler.reqId = window.requestAnimationFrame(loop);

        return handler;
    };

    /**
     * 利用 requestAnimationFrame 实现 setTimeout 的功能
     *
     * @param {Function} fn 循环执行的函数
     * @param {number} delay 延迟时间间隔
     *
     * @return {Object} 带有 requestId 的对象
     */
    exports.rafTimeout = function (fn, delay) {
        var start = util.getTimestamp();
        var handler = {};

        function loop() {
            var current = util.getTimestamp();
            var realDelta = current - start;

            realDelta >= delay
                ? fn.call(null, exports.getConfig('delta'), realDelta, 1000 / realDelta)
                : handler.reqId = window.requestAnimationFrame(loop);
        }

        handler.reqId = window.requestAnimationFrame(loop);

        return handler;
    };

    /**
     * 清除 requestAnimationFrame
     *
     * @param {Object} handler rafInterval, rafTimeout 中返回的那个带有 requestId 的对象
     */
    exports.clearRaf = function (handler) {
        if (!handler) {
            return;
        }
        if (typeof handler === 'object') {
            window.cancelAnimationFrame(handler.reqId);
        }
        else {
            window.cancelAnimationFrame(handler);
        }
    };

    /**
     * 循环
     *
     * @param {Object} opts 参数对象
     * @param {Function} opts.step 每帧中切分出来的每个时间片里执行的函数，通常做动画的更新
     * @param {Function} opts.render 每帧执行的函数，通常做动画的渲染
     * @param {number} opts.fps 当前这个 loop 的 fps，可以通过设置这个值来变相的实现
     *                          改变 requestAnimationFrame 的时间间隔，如果不设置，则使用
     *                          exports.getConfig('fps') 里的 fps 默认值即 60fps，如果帧数
     *                          为 60，那么意味着每 1000 / 60 = 16ms 就执行一帧
     *
     * @return {Object} 带有标示属性的对象
     */
    exports.loop = function (opts) {
        var conf = util.extend(true, {}, {
            step: util.noop,
            render: util.noop,
            fps: exports.getConfig('fps')
        }, opts);

        var previous = util.getTimestamp();
        var accumulateTime = 0;

        return exports.rafInterval(function (delta, realDelta, realFps) {
            var current = util.getTimestamp();
            var passed = current - previous;
            previous = current;
            accumulateTime += passed;
            while (accumulateTime >= exports.getConfig('delta')) {
                conf.step(delta, realDelta, realFps);
                accumulateTime -= exports.getConfig('delta');
            }
            conf.render(delta, realDelta, realFps);
        }, 1000 / conf.fps);
    };

    exports.aa = 123;

    /* var a= ['a', 'b', 'c', 'd']
    var i = -1;while(++i < a.length) {console.log(i, a[i])};console.warn(i);

    var a= ['a', 'b', 'c', 'd']
    var i = a.length;while(--i > -1) {console.log(i,a[i])};console.warn(i);

    console.time('a');
    var a1 = new Float32Array(1000000);
    var ia1 = a1.length;
    while (--ia1 > -1) {
        a1[ia1] = ia1;
    }
    console.timeEnd('a');
    console.time('a-2');
    var a2 = [];
    var ia2 = 1000000;
    while (--ia2 > -1) {
        a2[ia2] = ia2;
    }
    console.timeEnd('a-2');

    console.time('b');
    var b1 = new Float32Array(1000000);
    var ib1 = -1;
    while (++ib1 < b1.length) {
        b1[ib1] = ib1;
    }
    console.timeEnd('b');
    console.time('b-2');
    var b2 = [];
    var ib2 = -1;
    while (++ib2 < 1000000) {
        b2[ib2] = ib2;
    }
    console.timeEnd('b-2');

    console.time('c');
    var c1 = new Float32Array(1000000);
    for (var ic1 = 0, c1Len = c1.length; ic1 < c1Len; ic1++) {
        c1[ic1] = ic1;
    }
    console.timeEnd('c');

    console.time('c-2');
    var c2 = [];
    for (var ic2 = 1000000; ic2 > 0; ic2--) {
        c2[ic2] = ic2;
    }
    console.timeEnd('c-2');



    var a = [];
    for (var i = 0; i < 1000000; i++) {
        a.push(i);
    }

    console.time('while end->start');
    var i = a.length;
    while (--i > -1) {
    }
    console.timeEnd('while end->start');

    console.time('while start->end');
    var i = -1;
    while (++i < a.length) {
    }
    console.timeEnd('while start->end');

    console.time('for start->end');
    var start = Date.now();
    for (var i = 0, len = a.length; i < len; i++) {
    }
    console.timeEnd('for start->end');


    console.time('for end->start');
    for (var i = a.length - 1; i >= 0; i--) {
    }
    console.timeEnd('for end->start');*/

    return exports;

});
