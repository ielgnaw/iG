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
        DisplayObject.call(this, this);

        util.extend(true, this, {
            // 文字内容
            content: '',
            // 大小
            size: 30,
            // 是否粗体
            isBold: false,
            // 字体
            fontFamily: 'sans-serif'
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
         * 渲染当前 Text 实例
         *
         * @param {Object} offCtx 离屏 canvas 2d context 对象
         *
         * @return {Object} 当前 Text 实例
         */
        render: function (offCtx) {
            offCtx.save();

            offCtx.fillStyle = this.fillStyle;
            offCtx.globalAlpha = this.alpha;
            offCtx.font = this.font;

            this.matrix.reset();
            this.matrix.translate(this.x, this.y);
            this.matrix.rotate(this.angle);
            this.matrix.scale(this.scaleX, this.scaleY);
            var m = this.matrix.m;
            offCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            offCtx.fillText(this.content, -this.bounds.width * 0.5, -this.bounds.height * 0.5);

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
            if (this.debug) {
                offCtx.save();

                var m = this.matrix.reset().m;
                this.matrix.translate(
                    -this.bounds.x - this.bounds.width * 0.5,
                    -this.bounds.y - this.bounds.height - 10
                );
                offCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
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
