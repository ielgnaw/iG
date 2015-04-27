/**
 * @file 主入口文件
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    /**
     * requestAnimationFrame polyfill
     */
    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.msRequestAnimationFrame
            || window.oRequestAnimationFrame
            || function (callback, elem) {
                    var me = this;
                    var start;
                    var finish;
                    setTimeout(function () {
                        start = +new Date();
                        callback(start);
                        finish = +new Date();
                        me.timeout = 1000 / 60 - (finish - start);
                    }, me.timeout);
                };
    })();

    /**
     * cancelAnimationFrame polyfill
     */
    window.cancelAnimationFrame = (function () {
        return window.cancelAnimationFrame
                || window.webkitCancelAnimationFrame
                || window.webkitCancelRequestAnimationFrame
                || window.mozCancelAnimationFrame
                || window.mozCancelRequestAnimationFrame
                || window.msCancelAnimationFrame
                || window.msCancelRequestAnimationFrame
                || window.oCancelAnimationFrame
                || window.oCancelRequestAnimationFrame
                || window.clearTimeout;
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
            fps: 60,
            exec: util.noop,
            ticksPerFrame: 0
        }, opts);

        var requestId;
        var now;
        var delta;
        var then = Date.now();
        var interval = 1000 / conf.fps;
        var tickUpdateCount = 0;

        (function tick() {
            requestId = window.requestAnimationFrame(tick);
            now = Date.now();
            delta = now - then;
            if (delta > interval) {
                then = now - (delta % interval);
                tickUpdateCount++;
                if (tickUpdateCount > conf.ticksPerFrame) {
                    tickUpdateCount = 0;
                    conf.exec(requestId);
                }
            }
        })();
    };

    return exports;

});
