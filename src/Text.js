/**
 * @file 文字基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var util = require('./util');
    var DisplayObject = require('./DisplayObject');

    /**
     * Text 基类
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
            height: obj.height
        };

        this.font = ''
            + (this.isBold ? 'bold ' : '')
            + this.size
            + 'pt '
            + this.fontFamily;

        if (this.useCache) {
            this.cacheCanvas = document.createElement('canvas');
            this.cacheCtx = this.cacheCanvas.getContext('2d');
            this.cacheCanvas.width = this.bounds.width;
            this.cacheCanvas.height = this.bounds.height;
            this.cache();
        }
        return this;
    }

    Text.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Text,

        /**
         * 改变内容
         *
         * @param {string} content 内容
         *
         * @return {Object} 当前 Text 实例
         */
        changeContent: function (content) {
            this.content = content;
            var obj = measureText(this.content, this.isBold, this.fontFamily, this.size);
            this.bounds = {
                x: this.x,
                y: this.y,
                width: obj.width,
                height: obj.height
            };
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
         * 缓存，把需要重复绘制的画面数据进行缓存起来，减少调用 canvas API 的消耗
         *
         * @return {Object} 当前 Text 实例
         */
        cache: function () {
            this.cacheCtx.save();
            this.cacheCtx.fillStyle = this.fillStyle;
            this.cacheCtx.globalAlpha = this.alpha;
            this.cacheCtx.font = this.font;
            this.cacheCtx.fillText(this.content, 0, this.bounds.height);
            this.cacheCtx.restore();
            return this;
        },

        /**
         * 渲染当前 Text 实例
         *
         * @param {Object} ctx canvas 2d context 对象
         * @param {number} execCount 每帧执行的函数的计数器
         *
         * @return {Object} 当前 Text 实例
         */
        render: function (ctx, execCount) {
            ctx.save();
            ctx.fillStyle = this.fillStyle;
            ctx.globalAlpha = this.alpha;
            ctx.font = this.font;

            this.matrix.reset();
            this.matrix.translate(this.x, this.y);
            this.matrix.rotate(this.angle);
            this.matrix.scale(this.scaleX, this.scaleY);
            var m = this.matrix.m;
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

            if (this.useCache) {
                ctx.drawImage(this.cacheCanvas, -this.bounds.width / 2, -this.bounds.height / 2);
            }
            else {
                ctx.fillText(this.content, -this.bounds.width / 2, this.bounds.height / 2);
            }

            this.debugRender(ctx);
            ctx.restore();

            // ctx.fillStyle = 'black';
            // ctx.fillRect(100, 0, 1, 1000);
            // ctx.fillRect(0, 100, 1000, 1);

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
                var m = this.matrix.reset().m;
                this.matrix.translate(
                    -this.bounds.x - this.bounds.width * 0.5,
                    -this.bounds.y - this.bounds.height * 0.5
                );
                ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

                ctx.strokeStyle = 'black';
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
