/**
 * @file 圆形
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var util = require('../util');
    var DisplayObject = require('../DisplayObject');
    var collision = require('../collision');
    var Vector = require('./Vector');

    var abs = Math.abs;
    var sqrt = Math.sqrt;

    /**
     * Circle 基类
     *
     * @extends DisplayObject
     * @constructor
     *
     * @param {Object} opts 参数 x, y, radius
     */
    function Circle(opts) {
        DisplayObject.apply(this, arguments);
    }

    Circle.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Circle,

        /**
         * 是否和另一个圆形相交
         *
         * @param {Circle} otherCircle 另一个圆形
         * @param {boolean} isShowCollideResponse 是否需要碰撞的响应
         *
         * @return {boolean} 是否相交
         */
        intersects: function (otherCircle, isShowCollideResponse) {
            return collision.checkCircleCircle(this, otherCircle, isShowCollideResponse);
        },

        /**
         * 是否和另一个矩形相交
         *
         * @param {Rect} otherCRect 另一个矩形
         * @param {boolean} isShowCollideResponse 是否需要碰撞的响应
         *
         * @return {boolean} 是否相交
         */
        intersectsRect: function (otherCRect, isShowCollideResponse) {
            return collision.checkCircleCircle(this, otherCRect, isShowCollideResponse);
        },

        /**
         * 某个点是否和圆形相交
         *
         * @param {number} x 点的横坐标
         * @param {number} y 点的纵坐标
         *
         * @return {boolean} 是否相交
         */
        hitTestPoint: function (x, y) {
            var dx = abs(x - this.x);
            var dy = abs(y - this.y);

            var dz = sqrt(dx * dx + dy * dy);
            if (dz <= this.radius) {
                return true;
            }

            return false;
        },

        /**
         * debug 时渲染边界盒
         *
         * @param {Object} offCtx 离屏 canvas 2d context 对象
         */
        debugRender: function (offCtx) {
            if (this.debug) {
                offCtx.save();
                offCtx.strokeStyle = 'black';
                offCtx.strokeRect(
                    this.x - this.radius,
                    this.y - this.radius,
                    this.radius * 2,
                    this.radius * 2
                );
                offCtx.restore();
            }
        }
    };

    util.inherits(Circle, DisplayObject);

    return Circle;

});
