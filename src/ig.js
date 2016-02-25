/**
 * @file 主入口文件
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

/* global ig */

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

    var exports = {};

    var util = require('./util');

    /**
     * requestAnimationFrame 封装
     *
     * @param {Function} fn 循环执行的函数
     * @param {number} delay 延迟时间间隔
     * @param {string} loopId 标示，可以根据这个标示停止循环
     *
     * @return {Object} 带有标示属性的对象
     */
    window.requestTimeout = function (fn, delay, loopId) {
        if (!delay) {
            delay = 0;
        }

        if (!loopId) {
            loopId = String(ig.util.getTimestamp());
        }

        var start = new Date().getTime();

        var handler = {
            loopId: loopId
        };

        function loop() {
            handler.reqId = window.requestAnimationFrame(loop);
            var current = util.getTimestamp();
            var realDelta = current - start;
            if (realDelta >= delay) {
                fn.call(null, realDelta);
                start = new Date().getTime();
            }
        }

        handler.reqId = window.requestAnimationFrame(loop);

        return handler;
    };

    /**
     * 清除 requestAnimationFrame
     *
     * @param {number} reqId requestAnimationFrame 的 id
     * @param {string} loopId 标示，可以根据这个标示停止循环
     */
    window.clearRequestTimeout = function (reqId, loopId) {
        if (!reqId) {
            return;
        }
        window.cancelAnimationFrame(reqId);

        var pools = exports.reqAniPools;
        var index = pools.indexOf(loopId);
        index > -1 ? pools.splice(index, 1) : '';
    };

    var config = require('./config');

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
     * requestAnimationFrame 池
     *
     * @type {Array}
     */
    exports.reqAniPools = [];

    /**
     * 利用 requestAnimationFrame 来循环
     *
     * @param {Object} opts 参数对象
     * @param {Function} opts.step 每帧中切分出来的每个时间片里执行的函数
     * @param {Function} opts.exec 每帧执行的函数
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
            exec: util.noop,
            fps: exports.getConfig('fps'),
            loopId: String(util.getTimestamp())
        }, opts);

        exports.reqAniPools.push(conf.loopId);

        var previous = util.getTimestamp();
        var accumulateTime = 0;

        // dt 是 ig 环境默认的 delta，用这个值是为了保证 time based animation
        var dt = ig.getConfig('dt');

        // realDelta 是根据不同 fps 计算出来的实际的 realDelta，用这个值可以用来计算真实的 fps
        var handler = window.requestTimeout(function (realDelta) {
            var current = util.getTimestamp();
            var passed = current - previous;
            previous = current;
            accumulateTime += passed;
            while (accumulateTime >= dt) {
                conf.step(dt, realDelta);
                accumulateTime -= dt;
            }
            conf.exec(dt, realDelta);
        }, 1000 / conf.fps, conf.loopId);

        return handler;
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
