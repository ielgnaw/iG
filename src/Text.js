/**
 * @file 文字基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var util = require('./util');
    var DisplayObject = require('./DisplayObject');
    var polygon = require('./geom/polygon');

    /**
     * Text 基类
     *
     * @extends DisplayObject
     * @constructor
     *
     * @param {Object} opts 参数，x, y, content, color, size, holdTime
     */
    function Text(opts) {
        opts = opts || {};
        DisplayObject.apply(this, arguments);

        util.extend(this, {
            // 文字内容
            content: '0',

            // 颜色
            color: this.fillStyle,

            // 大小
            size: 30,

            // 持续时间，为 0 代表不会消失
            holdTime: 0,

            animate: util.extend({}, {
                duration: 1000
            }, opts.animate)
        }, opts);

        console.warn(this);

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

            offCtx.fillStyle = this.color;
            offCtx.globalAlpha = this.alpha;
            offCtx.translate(this.x, this.y);
            offCtx.rotate(util.deg2Rad(this.angle));
            offCtx.scale(this.scaleX, this.scaleY);
            offCtx.translate(-this.x, -this.y);
            offCtx.font = 'bold ' + this.size + 'px sans-serif';

            var content = this.content;
            var m = offCtx.measureText(content).width;
            offCtx.fillText(this.content, this.x - m * 0.5, this.y);
            offCtx.restore();

            return this;
        }
    };

    util.inherits(Text, DisplayObject);

    return Text;

});
