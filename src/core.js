/**
 * @file 核心
 * @author ielgnaw(wuji0223@gmail.com)
 */

(function (root, ig, undefined) {

    /**
     * requestAnimationFrame polyfill
     */
    ig.requestAnimFrame = (function () {
        return root.requestAnimationFrame
            || root.webkitRequestAnimationFrame
            || root.mozRequestAnimationFrame
            || root.msRequestAnimationFrame
            || root.oRequestAnimationFrame
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
    ig.cancelAnimFrame = (function () {
        return root.cancelAnimationFrame
                || root.webkitCancelAnimationFrame
                || root.webkitCancelRequestAnimationFrame
                || root.mozCancelAnimationFrame
                || root.mozCancelRequestAnimationFrame
                || root.msCancelAnimationFrame
                || root.msCancelRequestAnimationFrame
                || root.oCancelAnimationFrame
                || root.oCancelRequestAnimationFrame
                || root.clearTimeout;
    })();

    /**
     * 空函数
     */
    ig.noop = function () {};

    /**
     * 为类型构造器建立继承关系
     *
     * @param {Function} subClass 子类构造器
     * @param {Function} superClass 父类构造器
     * @return {Function} 返回 subClass 构造器
     */
    ig.inherits = function (subClass, superClass) {
        ig.noop.prototype = superClass.prototype;
        var subProto = subClass.prototype;
        var proto = subClass.prototype = new ig.noop();

        for (var key in subProto) {
            proto[key] = subProto[key];
        }

        subClass.prototype.constructor = subClass;
        subClass.superClass = superClass.prototype;

        return subClass;
    };

    /**
     * 根据角度计算弧度
     * 弧度 = 角度 * Math.PI / 180
     *
     * @param {number} deg 角度值
     *
     * @return {number} 弧度值
     */
    ig.deg2Rad = function (deg) {
        return deg * Math.PI / 180;
    };

    /**
     * 根据弧度计算角度
     * 角度 = 弧度 * 180 / Math.PI
     *
     * @param {number} rad 弧度值
     *
     * @return {number} 角度值
     */
    ig.rad2Deg = function (rad) {
        return rad * 180 / Math.PI;
    };

    /**
     * 把页面上的鼠标坐标换成相对于 canvas 的坐标
     *
     * @param {HTML.Element} canvas canvas 元素
     * @param {number} x 相对于页面的横坐标
     * @param {number} y 相对于页面的纵坐标
     *
     * @return {Object} 相对于 canvas 的坐标对象
     */
    ig.window2Canvas = function (canvas, x, y) {
        var boundRect = canvas.getBoundingClientRect();
        return {
            x: Math.round(x - boundRect.left * (canvas.width / boundRect.width)),
            y: Math.round(y - boundRect.top * (canvas.height / boundRect.height))
        };
    };

    /**
     * func.apply(thisContext, args);
     *
     * @param {Function} func 待执行函数
     * @param {Object} thisContext 上下文
     * @param {Array} args 参数
     */
    ig.fastApply = function (func, thisContext, args) {
        switch (args.length) {
            case 0:
                return func.call(
                    thisContext
                );
            case 1:
                return func.call(
                    thisContext, args[0]
                );
            case 2:
                return func.call(
                    thisContext, args[0], args[1]
                );
            case 3:
                return func.call(
                    thisContext, args[0], args[1], args[2]
                );
            case 4:
                return func.call(
                    thisContext, args[0], args[1], args[2], args[3]
                );
            case 5:
                return func.call(
                    thisContext, args[0], args[1], args[2], args[3], args[4]
                );
            case 6:
                return func.call(
                    thisContext, args[0], args[1], args[2], args[3], args[4], args[5]
                );
            case 7:
                return func.call(
                    thisContext, args[0], args[1], args[2], args[3], args[4], args[5], args[6]
                );
            case 8:
                return func.call(
                    thisContext, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]
                );
            case 9:
                return func.call(
                    thisContext, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]
                );
            default:
                return func.apply(thisContext, args);
        }
    };

})(root || this, ig || {});