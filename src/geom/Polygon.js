/**
 * @file 顺时针方向凸多边形
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
     * Polygon 基类
     *
     * @extends DisplayObject
     * @constructor
     *
     * @param {Object} opts 参数 x, y, points，points 中的点坐标都是相对应 x, y 的
     */
    function Polygon(opts) {
        DisplayObject.apply(this, arguments);

        this.points = opts.points || [];
        this.recalc();

        // 最大最小顶点法来获取边界盒
        this.getBounds();

    }

    Polygon.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Polygon,

        /**
         * 重新计算多边形的边和法线，当多边形的点序列被改变以及获取边或法线时被调用
         *
         * @return {Polygon} Polygon 实例
         */
        recalc: function () {
            var points = this.points;
            var len = points.length;
            this.edges = []; // 边
            this.normals = []; // 法线
            for (var i = 0; i < len; i++) {
                var p1 = points[i];
                var p2 = i < len - 1 ? points[i + 1] : points[0];
                var e = new Vector().copy(p2).sub(p1);
                var n = new Vector().copy(e).perp().normalize();
                this.edges.push(e);
                this.normals.push(n);
            }
            return this;
        },

        /**
         * 最大最小顶点法来获取边界盒
         *
         * @return {Polygon} Polygon 实例
         */
        getBounds: function () {
            var points = this.points;
            var startX = this.x;
            var startY = this.y;

            var points = this.points;
            var startX = this.x;
            var startY = this.y;

            var minX = Number.MAX_VALUE;
            var maxX = Number.MIN_VALUE;
            var minY = Number.MAX_VALUE;
            var maxY = Number.MIN_VALUE;

            for (var i = 0, len = points.length; i < len; i++) {
                if (points[i].x < minX) {
                    minX = points[i].x;
                }
                if (points[i].x > maxX) {
                    maxX = points[i].x;
                }
                if (points[i].y < minY) {
                    minY = points[i].y;
                }
                if (points[i].y > maxY) {
                    maxY = points[i].y;
                }
            }

            this.bounds = {
                x: minX + startX,
                y: minY + startY,
                width: maxX - minX,
                height: maxY - minY
            };

            return this;
        },

        /**
         * 是否和另一个多边形相交
         *
         * @param {Polygon} otherPolygon 另一个多边形
         * @param {boolean} isShowCollideResponse 是否需要碰撞的响应
         *
         * @return {boolean} 是否相交
         */
        intersects: function (otherPolygon, isShowCollideResponse) {
            return collision.checkPolygonPolygon(this, otherPolygon, isShowCollideResponse);
        },

        /**
         * 是否和另一个矩形相交
         *
         * @param {Rect} otherCRect 另一个矩形
         * @param {boolean} isShowCollideResponse 是否需要碰撞的响应
         *
         * @return {boolean} 是否相交
         */
        intersectsCircle: function (otherCRect, isShowCollideResponse) {
            return collision.checkPolygonPolygon(this, otherCRect, isShowCollideResponse);
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

    util.inherits(Polygon, DisplayObject);

    return Polygon;

});
