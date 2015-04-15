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

    return exports;

});
