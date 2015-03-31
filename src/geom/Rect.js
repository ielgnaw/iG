/**
 * @file 矩形，这里的矩形指的是四个角均为直角的四边形
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var util = require('../util');
    var DisplayObject = require('../DisplayObject');
    var collision = require('../collision');
    var Polygon = require('./Polygon');
    var Vector = require('./Vector');

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

        this.toPolygon();
    }

    Rect.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Rect,

        /**
         * 转换成 polygon
         *
         * @return {Polygon} 创建出来的多边形
         */
        toPolygon: function () {
            var w = this.width;
            var h = this.height;
            var polygon = new Polygon(
                {
                    x: this.x,
                    y: this.y,
                    points: [
                        {
                            x: 0,
                            y: 0
                        },
                        {
                            x: w,
                            y: 0
                        },
                        {
                            x: w,
                            y: h
                        },
                        {
                            x: 0,
                            y: h
                        }
                    ]
                }
            );
            this.edges = polygon.edges;
            this.points = polygon.points;
            this.normals = polygon.normals;
            return this;
        },

        /**
         * 是否和另一个矩形相交
         *
         * @param {Rect} otherRect 另一个矩形
         *
         * @return {boolean} 是否相交
         */
        intersects: function (otherRect, isShowCollideResponse) {
            return collision.checkPolygonPolygon(this, otherRect, isShowCollideResponse);
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
        },

        /**
         * 最大最小顶点法来获取边界盒
         *
         * @return {Polygon} Polygon 实例
         */
        getBounds: function () {
            // console.warn(this);
            // debugger
            this.bounds = {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            };

            return this;
        },

        /**
         * debug 时渲染边界盒，多边形使用最大最小顶点法来渲染边界盒
         *
         * @param {Object} offCtx 离屏 canvas 2d context 对象
         */
        debugRender: function (offCtx) {
            if (this.debug) {
                this.getBounds();

                offCtx.save();
                offCtx.strokeStyle = 'black';

                offCtx.strokeRect(
                    this.bounds.x,
                    this.bounds.y,
                    this.bounds.width,
                    this.bounds.height
                );

                offCtx.restore();
            }
        }
    };

    util.inherits(Rect, DisplayObject);

    return Rect;

});
