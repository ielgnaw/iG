/**
 * @file 矩形，四个角均为直角的四边形
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var util = require('../util');
    var DisplayObject = require('../DisplayObject');

    /**
     * Rect 基类
     *
     * @extends DisplayObject
     * @constructor
     *
     * @param {Object} opts 参数 x, y, width, height
     */
    function Rect(opts) {
        DisplayObject.apply(this, arguments);
    }

    Rect.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Rect,

        /**
         * 是否和另一个矩形相交
         *
         * @param {Rect} otherRect 另一个矩形
         *
         * @return {boolean} 是否相交
         */
        intersects: function (otherRect) {
            return otherRect.x <= this.x + this.width && this.x <= otherRect.x + otherRect.width
                    && otherRect.y <= this.y + this.height && this.y <= otherRect.y + otherRect.height;
        },

        /**
         * 某个点是否和矩形相交
         *
         * @param {number} x 点的横坐标
         * @param {number} y 点的纵坐标
         *
         * @return {boolean} 是否相交
         */
        hitTestPoint: function (x, y) {
            return x >= this.x && x <= this.x + this.width
                    && y >= this.y && y <= this.y + this.height;
        }
    };

    util.inherits(Rect, DisplayObject);

    return Rect;

});
