/**
 * @file 主入口文件
 * @author ielgnaw(wuji0223@gmail.com)
 */

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

    /****** 把模块统一挂载到 exports 上，这个 exports 是挂载在 window 上的全局对象 ******/
    exports.util = require('./util');
    exports.Event = require('./event');
    exports.env = require('./platform');
    exports.BaseSprite = require('./BaseSprite');
    exports.ImageLoader = require('./ImageLoader');

    return exports;

});
