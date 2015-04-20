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

    return exports;

});
