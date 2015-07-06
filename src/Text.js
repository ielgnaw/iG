/**
 * @file 文字基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var util = require('./util');
    var DisplayObject = require('./DisplayObject');

    /**
     * Text 基类，Text 也是 Rectangle，但是这里不继承 Rectangle，直接继承 DisplayObject
     *
     * @extends DisplayObject
     * @constructor
     *
     * @param {Object} opts 参数，x, y, content, size, holdTime
     *
     * @return {Object} Text 实例
     */
    function Text(opts) {
        DisplayObject.call(this, opts);

        util.extend(true, this, {
            // 文字内容
            content: '',
            // 大小
            size: 30,
            // 是否粗体
            isBold: false,
            // 字体
            fontFamily: 'sans-serif',
            // 是否使用缓存
            useCache: true
        }, opts);

        var obj = measureText(this.content, this.isBold, this.fontFamily, this.size);
        this.bounds = {
            x: this.x,
            y: this.y,
            width: obj.width,
            height: obj.height,
            realWidth: obj.width,
            realHeight: obj.height
        };

        // 设置了宽度，那么文字就居中
        if (this.width !== 0) {
            this.bounds.width = this.width;
        }

        // 设置了高度
        if (this.height !== 0) {
            this.bounds.height = this.height;
        }

        this.width = this.bounds.width;
        this.height = this.bounds.height;

        this.font = ''
            + (this.isBold ? 'bold ' : '')
            + this.size
            + 'pt '
            + this.fontFamily;

        if (this.useCache) {
            this.initCacheCanvas();
        }

        return this;
    }

    Text.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Text,

        /**
         * 初始化缓存 canvas
         *
         * @return {Object} Text 实例
         */
        initCacheCanvas: function () {
            if (!this.cacheCanvas) {
                this.cacheCanvas = document.createElement('canvas');
                this.cacheCtx = this.cacheCanvas.getContext('2d');
            }
            this.cacheCanvas.width = this.bounds.width;
            this.cacheCanvas.height = this.bounds.height;
            this.cache();
            return this;
        },

        /**
         * 缓存，把需要重复绘制的画面数据进行缓存起来，减少调用 canvas API 的消耗
         *
         * @return {Object} Text 实例
         */
        cache: function () {
            this.cacheCtx.save();
            this.cacheCtx.fillStyle = this.fillStyle;
            this.cacheCtx.globalAlpha = this.alpha;
            this.cacheCtx.font = this.font;
            this.cacheCtx.fillText(
                this.content,
                this.bounds.width / 2  - this.bounds.realWidth / 2,
                this.bounds.height - 2
            );
            this.cacheCtx.restore();
            return this;
        },

        /**
         * 生成 points
         *
         * @return {Object} Text 实例
         */
        generatePoints: function () {
            this.points = [
                {
                    x: this.bounds.x,
                    y: this.bounds.y
                },
                {
                    x: this.bounds.x + this.bounds.width,
                    y: this.bounds.y
                },
                {
                    x: this.bounds.x + this.bounds.width,
                    y: this.bounds.y + this.bounds.height
                },
                {
                    x: this.bounds.x,
                    y: this.bounds.y + this.bounds.height
                }
            ];

            for (var i = 0, len = this.points.length; i < len; i++) {
                var transformPoint = this.matrix.transformPoint(this.points[i].x, this.points[i].y);
                this.points[i] = {
                    x: transformPoint.x,
                    y: transformPoint.y
                };
            }

            this.cx = this.bounds.x + this.bounds.width / 2;
            this.cy = this.bounds.y + this.bounds.height / 2;
            return this;
        },

        /**
         * 创建路径，只是创建路径，并没有画出来
         *
         * @param {Object} ctx canvas 2d context 对象
         *
         * @return {Object} Text 实例
         */
        createPath: function (ctx) {
            var points = this.points;
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
         * 某个点是否和当前 Text 实例相交
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
         * 改变内容
         *
         * @param {string} content 内容
         *
         * @return {Object} Text 实例
         */
        changeContent: function (content) {
            this.content = content;
            var obj = measureText(this.content, this.isBold, this.fontFamily, this.size);
            this.bounds = {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                realWidth: obj.width,
                realHeight: obj.height
            };
            this.initCacheCanvas();
            return this;
        },

        /**
         * 获取内容
         *
         * @return {string} 内容
         */
        getContent: function () {
            return this.content;
        },

        /**
         * 移动
         * x, y 是指要移动到的横轴、纵轴目标位置即终点坐标
         *
         * @param {number} x 终点横坐标
         * @param {number} y 终点纵坐标
         *
         * @return {Object} Text 实例
         */
        move: function (x, y) {
            this.x = this.bounds.x = x;
            this.y = this.bounds.y = y;

            this.generatePoints();

            return this;
        },

        /**
         * 渲染当前 Text 实例
         *
         * @param {Object} ctx canvas 2d context 对象
         * @param {number} execCount 每帧执行的函数的计数器
         *
         * @return {Object} Text 实例
         */
        render: function (ctx, execCount) {
            ctx.save();
            ctx.fillStyle = this.fillStyle;
            ctx.globalAlpha = this.alpha;
            ctx.font = this.font;

            // 如果有父精灵，那么就不需要自己设置 matrix 了，跟随父精灵变化
            if (!this.parent || !this.followParent) {
                this.matrix.reset();
                this.matrix.translate(this.cx, this.cy);
                this.matrix.rotate(this.angle);
                this.matrix.scale(this.scaleX, this.scaleY);
                this.matrix.translate(-this.cx, -this.cy);
            }

            this.matrix.setCtxTransform(ctx);

            this.generatePoints();

            if (this.useCache) {
                ctx.drawImage(this.cacheCanvas, this.bounds.x, this.bounds.y);
            }
            else {
                ctx.fillText(
                    this.content,
                    this.x + this.bounds.width / 2  - this.bounds.realWidth / 2,
                    this.bounds.y + this.bounds.height - 2
                );
            }

            this.debugRender(ctx);
            ctx.restore();

            // ctx.fillStyle = 'black';
            // ctx.fillRect(200, 0, 1, 1000);
            // ctx.fillRect(0, 200, 1000, 1);

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
                ctx.strokeRect(
                    this.bounds.x,
                    this.bounds.y,
                    this.bounds.width,
                    this.bounds.height
                );

                ctx.restore();
            }
        }
    };

    /**
     * 获取文字的高宽
     *
     * @param {string} text 文字内容
     * @param {boolean} isBold 是否加粗
     * @param {string} fontFamily 字体
     * @param {number} size 大小
     *
     * @return {Object} 高宽结果
     */
    function measureText(text, isBold, fontFamily, size) {
        var div = document.createElement('div');
        div.innerHTML = text;
        div.style.position = 'absolute';
        div.style.top = '-1000px';
        div.style.left = '-1000px';
        div.style.fontFamily = fontFamily;
        div.style.fontWeight = isBold ? 'bold' : 'normal';
        div.style.fontSize = size + 'pt';
        document.body.appendChild(div);
        var ret = {
            width: div.offsetWidth,
            height: div.offsetHeight
        };
        document.body.removeChild(div);
        return ret;
    }

    util.inherits(Text, DisplayObject);

    return Text;

});
