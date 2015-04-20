/**
 * @file 顺时针方向凸多边形
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var util = require('./util');
    var Vector = require('./Vector');
    var Projection = require('./Projection');
    var DisplayObject = require('./DisplayObject');

    /**
     * 多边形类
     *
     * @param {Object} opts 参数对象
     *
     * @return {Object} Polygon 实例
     */
    function Polygon(opts) {
        this.p = {};

        util.extend(true, this.p, {
            // 多边形各个顶点
            points: []
        }, opts);

        if (this.p.points.length) {
            this.p.x = this.p.points[0].x;
            this.p.y = this.p.points[0].y;
        }

        this.getBounds();

        this.p.cX = this.p.x + this.bounds.width / 2;
        this.p.cY = this.p.y + this.bounds.height / 2;

        if (this.p.cX >= this.bounds.x + this.bounds.width) {
            this.p.cX = this.bounds.x + this.bounds.width;
        }

        if (this.p.cY >= this.bounds.y + this.bounds.height) {
            this.p.cY = this.bounds.y + this.bounds.height;
        }

        this.originalPoints = util.extend(true, [], this.p.points);

        DisplayObject.call(this, this.p);

        return this;
    }

    Polygon.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Polygon,

        /**
         * 创建路径，只是创建路径，并没有画出来
         *
         * @param {Object} offCtx 离屏 canvas 2d context 对象
         *
         * @return {Object} Polygon 实例
         */
        createPath: function (offCtx) {
            // console.warn(this.matrix);
            var p = this.p;
            var points = p.points;
            var len = points.length;
            if (!len) {
                return;
            }

            offCtx.beginPath();
            offCtx.moveTo(points[0].x, points[0].y);
            for (var i = 0; i < len; i++) {
                offCtx.lineTo(points[i].x, points[i].y);
            }
            offCtx.closePath();
            return this;
        },

        /**
         * 多边形移动
         *
         * @param {number} x 移动的横坐标，移动的距离
         * @param {number} y 移动的纵坐标，移动的距离
         *
         * @return {Object} Polygon 实例
         */
        move: function (x, y) {
            var points = this.p.points;
            var len = points.length;
            for (var i = 0; i < len; i++) {
                var point = points[i];
                point.x += x;
                point.y += y;
            }
            return this;
        },

        /**
         * 获取多边形每边的轴
         *
         * @return {Array} 轴数组
         */
        getAxes: function () {
            var v1 = new Vector();
            var v2 = new Vector();
            var axes = [];
            var points = this.p.points;
            for (var i = 0, len = points.length - 1; i < len; i++) {
                v1.x = points[i].x;
                v1.y = points[i].y;
                v2.x = points[i + 1].x;
                v2.y = points[i + 1].y;

                // v1.edge(v2).normal() 指示投影轴的方向
                axes.push(v1.edge(v2).normal());
            }
            return axes;
        },

        /**
         * 投射多边形上的每个点到指定的轴 (axis)
         *
         * @param {Object} axis 轴对象
         *
         * @return {Object} 投射对象
         */
        project: function (axis) {
            var scalars = [];
            var v = new Vector();
            var points = this.p.points;
            for (var i = 0, len = points.length; i < len; i++) {
                var point = points[i];
                v.x = point.x;
                v.y = point.y;
                scalars.push(v.dot(axis));
            }
            return new Projection(
                Math.min.apply(Math, scalars),
                Math.max.apply(Math, scalars)
            );
        },

        /**
         * 多边形和多边形的碰撞
         *
         * @param {Object} polygon 多边形
         *
         * @return {boolean} 结果
         */
        collidesWith: function (polygon) {
            var axes = this.getAxes().concat(polygon.getAxes());
            return !this.separationOnAxes(axes, polygon);
        },

        /**
         * 找出分离轴
         *
         * @param {Array} axes 轴数组
         * @param {Object} polygon 对变形
         *
         * @return {boolean} 是否存在分离轴
         */
        separationOnAxes: function (axes, polygon) {
            for (var i = 0, len = axes.length; i < len; i++) {
                var axis = axes[i];
                var projection1 = polygon.project(axis);
                var projection2 = this.project(axis);
                if (!projection1.overlaps(projection2)) {
                    return true;
                }
            }
            return false;
        },

        /**
         * 判断点是否在多边形内
         * 由于在游戏里，大部分都是贴图，形状只是用来辅助的
         * 因此这里忽略了 isPointInPath 方法获取 lineWidth 上的点的问题
         * 小游戏就简单使用 cnavas context 的 isPointInPath 方法
         *
         * @param {Object} offCtx 离屏 canvas 2d context 对象
         * @param {number} x 横坐标
         * @param {number} y 纵坐标
         *
         * @return {boolean} 结果
         */
        isPointInPath: function (ctx, x, y) {
            this.createPath(ctx);
            return ctx.isPointInPath(x, y);
        },

        /**
         * 最大最小顶点法来获取边界盒
         *
         * @return {Polygon} Polygon 实例
         */
        getBounds: function () {
            var points = this.p.points;

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
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };

            // this.p.cX = this.p.x + this.bounds.width / 2;
            // this.p.cY = this.p.y + this.bounds.height / 2;

            return this;
        },

        /**
         * 渲染当前 Text 实例
         *
         * @param {Object} offCtx 离屏 canvas 2d context 对象
         *
         * @return {Object} 当前 Text 实例
         */
        render: function (offCtx) {
            offCtx.save();
            offCtx.fillStyle = this.p.fillStyle;
            offCtx.strokeStyle = this.p.strokeStyle;
            offCtx.globalAlpha = this.p.alpha;

            this.matrix.reset();
            // var m = this.matrix.m;
            // offCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            // this.matrix.translate(this.p.cX, this.p.cY);
            this.matrix.translate(this.p.cX, this.p.cY);
            this.matrix.rotate(this.p.angle);
            this.matrix.scale(this.p.scaleX, this.p.scaleY);

            var m = this.matrix.m;
            offCtx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

            for (var i = 0, len = this.p.points.length; i < len; i++) {
                this.p.points[i] = {
                    x: this.originalPoints[i].x - this.p.cX,
                    y: this.originalPoints[i].y - this.p.cY
                };
            }
            this.createPath(offCtx);
            offCtx.fill();
            offCtx.stroke();

            this.getBounds();
            this.debugRender(offCtx);

            offCtx.restore();
            return this;
        },

        /**
         * debug 时渲染边界盒，多边形使用最大最小顶点法来渲染边界盒
         * 碰撞时，根据此边界盒判断
         *
         * @param {Object} offCtx 离屏 canvas 2d context 对象
         */
        debugRender: function (offCtx) {
            if (this.p.debug) {
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
