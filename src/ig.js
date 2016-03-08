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

    var now = Date.now || function() {
        return (new Date).getTime()
    }

    function AnimationFrame(options) {
        if (!(this instanceof AnimationFrame)) return new AnimationFrame(options)
        options || (options = {})

        // Its a frame rate.
        if (typeof options == 'number') options = {frameRate: options}
        this.options = options
        this.frameRate = options.frameRate || AnimationFrame.FRAME_RATE
        this._frameLength = 1000 / this.frameRate
        this._isCustomFrameRate = this.frameRate !== AnimationFrame.FRAME_RATE
        this._timeoutId = null
        this._callbacks = {}
        this._lastTickTime = 0
        this._tickCounter = 0
    }

    AnimationFrame.FRAME_RATE = 60;

    /**
     * Request animation frame.
     * We will use the native RAF as soon as we know it does works.
     *
     * @param {Function} callback
     * @return {Number} timeout id or requested animation frame id
     * @api public
     */
    AnimationFrame.prototype.request = function(callback) {
        var self = this

        // Alawys inc counter to ensure it never has a conflict with the native counter.
        // After the feature test phase we don't know exactly which implementation has been used.
        // Therefore on #cancel we do it for both.
        ++this._tickCounter

        if (!callback) throw new TypeError('Not enough arguments')

        if (this._timeoutId == null) {
            // Much faster than Math.max
            // http://jsperf.com/math-max-vs-comparison/3
            // http://jsperf.com/date-now-vs-date-gettime/11
            var delay = this._frameLength + this._lastTickTime - now()
            if (delay < 0) delay = 0

            this._timeoutId = setTimeout(function() {
                self._lastTickTime = now()
                self._timeoutId = null
                ++self._tickCounter
                var callbacks = self._callbacks
                self._callbacks = {}
                for (var id in callbacks) {
                    if (callbacks[id]) {
                        callbacks[id](Date.now())
                    }
                }
            }, delay)
        }

        this._callbacks[this._tickCounter] = callback

        return this._tickCounter;
    }

    /**
     * Cancel animation frame.
     *
     * @param {Number} timeout id or requested animation frame id
     *
     * @api public
     */
    AnimationFrame.prototype.cancel = function(id) {
        if (nativeImpl.supported && this.options.useNative) nativeCancel(id)
        delete this._callbacks[id];
    }

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

            if (realDelta >= delay) {
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

        // return exports.rafInterval(function (delta, realDelta, realFps) {
        //     var current = util.getTimestamp();
        //     var passed = current - previous;
        //     previous = current;
        //     accumulateTime += passed;
        //     while (accumulateTime >= exports.getConfig('delta')) {
        //         conf.step(delta, realDelta, realFps);
        //         accumulateTime -= exports.getConfig('delta');
        //     }
        //     conf.render(delta, realDelta, realFps);
        // // }, 1000 / conf.fps);
        // }, 0);

        var aaa = new AnimationFrame();

        (function tick() {
            conf.step();
            conf.render();
            aaa.request(tick);
        })();

    };

    exports.aa = 123;

    return exports;

});
