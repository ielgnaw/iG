/**
 * @file 多边形
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var util = require('./util');
    var Vector = require('./Vector');
    var Projection = require('./Projection');
    var DisplayObject = require('./DisplayObject');

    /**
     * 多边形
     *
     * @param {Object} opts 参数对象
     *
     * @return {Object} Polygon 实例
     */
    function Polygon(opts) {
        DisplayObject.call(this, opts);

        util.extend(true, this, {
            // 多边形各个顶点，相对于 this.x, this.y
            points: []
        }, opts);

        for (var i = 0, len = this.points.length; i < len; i++) {
            var point = this.points[i];
            this.points[i] = {
                x: point.x + this.x,
                y: point.y + this.y
            };
        }

        // 初始状态的一些备份
        this.origin = {
            // 初始的起始点横坐标
            x: this.x,
            // 初始的起始点纵坐标
            y: this.y,
            // 初始的 points，变换时会用到，这个值在 move 或者 moveStep 的时候会变化
            points: util.extend(true, [], this.points),
            // 初始的 points，由于变换时 this.origin.points 会变化
            // 因此加入 persistencePoints，为了在 move 的时候记录最原始的 points
            persistencePoints: util.extend(true, [], this.points)
        };

        // this.generatePoints();
        this.getBounds();

        this.cx = this.bounds.x + this.bounds.width / 2;
        this.cy = this.bounds.y + this.bounds.height / 2;

        return this;
    }

    Polygon.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Polygon,

        /**
         * 生成 points
         *
         * @return {Object} Polygon 实例
         */
        generatePoints: function () {
            for (var i = 0, len = this.origin.points.length; i < len; i++) {
                var transformPoint = this.matrix.transformPoint(this.origin.points[i].x, this.origin.points[i].y);
                this.points[i] = {
                    x: transformPoint.x,
                    y: transformPoint.y
                };
            }

            return this;
        },

        /**
         * 最大最小顶点法来获取边界盒 points
         *
         * @return {Object} Polygon 实例
         */
        getBounds: function () {
            var points = this.points;

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

            return this;
        },

        /**
         * 最大最小顶点法来获取边界盒 origin.points
         *
         * @return {Object} Polygon 实例
         */
        getOriginBounds: function () {
            var points = this.origin.points;

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

            this.originBounds = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };

            return this;
        },

        /**
         * 创建路径，只是创建路径，并没有画出来
         *
         * @param {Object} ctx canvas 2d context 对象
         *
         * @return {Object} Polygon 实例
         */
        createPath: function (ctx) {
            var points = this.points;

            if (!points) {
                return;
            }

            var len = points.length;
            if (!len) {
                return;
            }

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (var i = 0; i < len; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            return this;
        },

        /**
         * 判断点是否在多边形内
         * 由于在游戏里，大部分都是贴图，形状只是用来辅助的
         * 因此这里忽略了 isPointInPath 方法获取 lineWidth 上的点的问题
         * 小游戏就简单使用 cnavas context 的 isPointInPath 方法
         *
         * @param {Object} ctx canvas 2d context 对象
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
         * 某个点是否和当前 DisplayObject 实例相交，这个方法应该是由子类重写的
         *
         * @override
         *
         * @param {number} x 点的横坐标
         * @param {number} y 点的纵坐标
         *
         * @return {boolean} 是否相交
         */
        hitTestPoint: function (x, y) {
            var stage = this.stage;
            return this.isPointInPath(stage.ctx, x, y);
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
            var points = this.points;
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
            var points = this.points;
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
         * @param {Object} polygon 多边形
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
         * 移动，设置位置，即设置 x, y
         * x, y 是指要移动到的横轴、纵轴目标位置即终点坐标
         *
         * @param {number} x 终点横坐标
         * @param {number} y 终点纵坐标
         *
         * @return {Object} Polygon 实例
         */
        move: function (x, y) {
            this.x = x;
            this.y = y;
            for (var j = 0, len = this.origin.persistencePoints.length; j < len; j++) {
                this.origin.points[j] = {
                    x: this.origin.persistencePoints[j].x + x - this.origin.x,// - x,
                    y: this.origin.persistencePoints[j].y + y - this.origin.y// - y
                };
            }

            var points = this.origin.points;

            var minX = Number.MAX_VALUE;
            var maxX = Number.MIN_VALUE;
            var minY = Number.MAX_VALUE;
            var maxY = Number.MIN_VALUE;

            for (var i = 0, pLen = points.length; i < pLen; i++) {
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

            this.cx = minX + (maxX - minX) / 2;
            this.cy = minY + (maxY - minY) / 2;

            this.getOriginBounds();

            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                if (child.followParent) {
                    child.move(x + child.relativeX, y + child.relativeY);
                }
            }

            return this;
        },

        /**
         * 渲染当前 Polygon 实例
         *
         * @param {Object} ctx canvas 2d context 对象
         *
         * @return {Object} 当前 Polygon 实例
         */
        render: function (ctx) {
            _childrenHandler.call(this);

            ctx.save();
            ctx.fillStyle = this.fillStyle;
            ctx.strokeStyle = this.strokeStyle;
            ctx.globalAlpha = this.alpha;

            this.matrix.reset();
            this.matrix.translate(this.cx, this.cy);
            this.matrix.rotate(this.angle);
            this.matrix.scale(this.scaleX, this.scaleY);
            this.matrix.translate(-this.cx, -this.cy);

            this.generatePoints();
            this.getBounds();
            this.createPath(ctx);

            ctx.fill();
            ctx.stroke();

            ctx.restore();

            for (var i = 0; i < this.children.length; i++) {
                this.children[i].setMatrix(this.matrix.m);
            }

            this.debugRender(ctx);

            return this;
        },

        /**
         * debug 时渲染边界盒，多边形使用最大最小顶点法来渲染边界盒
         * 碰撞时，根据此边界盒判断
         *
         * @param {Object} ctx canvas 2d context 对象
         */
        debugRender: function (ctx) {
            if (this.debug) {
                ctx.save();

                ctx.strokeStyle = '#0f0';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    this.bounds.x,
                    this.bounds.y,
                    this.bounds.width,
                    this.bounds.height
                );

                if (this.points.length) {
                    ctx.strokeStyle = '#f00';
                    ctx.beginPath();
                    this.createPath(ctx);
                    ctx.closePath();
                    ctx.stroke();
                }

                ctx.restore();
            }
        }
    };

    /**
     * 子精灵的处理
     */
    function _childrenHandler() {
        if (!this._.isHandleChildren) {
            this._.isHandleChildren = true;
            var children = this.children;
            if (!Array.isArray(children)) {
                children = [children];
            }

            var stage = this.stage;
            var len = children.length;

            // 实例化 children 的时候，children 的 x, y 是相对于 parent 的 x, y 的
            for (var i = 0; i < len; i++) {
                var child = children[i];
                child.relativeX = child.x;
                child.relativeY = child.y;
                child.x += this.x;
                child.y += this.y;
                child.move(child.x, child.y);
                child.parent = this;
                child.setMatrix(this.matrix.m);
                stage.addDisplayObject(child);
            }
        }
    }

    util.inherits(Polygon, DisplayObject);

    return Polygon;
});
