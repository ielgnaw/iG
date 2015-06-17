/**
 * @file 位图精灵（矩形），这个精灵承载一个静态的图片
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var util = require('./util');
    var Rectangle = require('./Rectangle');

    /**
     * Bitmap 基类
     *
     * @extends DisplayObject
     * @constructor
     *
     * @param {Object} opts 参数
     *
     * @return {Object} Bitmap 实例
     */
    function Bitmap(opts) {
        opts = opts || {};
        if (!opts.image) {
            throw new Error('Bitmap must be require a image param');
        }

        Rectangle.call(this, opts);

        util.extend(true, this, {
            width: 0,
            height: 0,

            // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            // 这四个参数对应 drawImage 的 sx, sy, sWidth, sHeight
            sx: 0,
            sy: 0,
            sWidth: 0,
            sHeight: 0
        }, opts);

        return this;
    }

    Bitmap.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Bitmap,

        /**
         * 渲染当前 Bitmap 实例
         *
         * @param {Object} ctx canvas 2d context 对象
         *
         * @return {Object} 当前 Bitmap 实例
         */
        render: function (ctx) {
            // console.warn(2);
            ctx.save();
            ctx.globalAlpha = this.alpha;

            if (this.width === 0) {
                this.width = this.asset.width;
            }

            if (this.sWidth === 0) {
                this.sWidth = this.asset.width;
            }

            if (this.height === 0) {
                this.height = this.asset.height;
            }

            if (this.sHeight === 0) {
                this.sHeight = this.asset.height;
            }

            Bitmap.superClass.render.apply(this, arguments);

            var m = this.matrix.m;
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

            ctx.drawImage(
                this.asset,
                this.sx, this.sy, this.sWidth, this.sHeight,
                this.x, this.y, this.width, this.height
            );

            ctx.restore();

            return this;
        }
    };

    util.inherits(Bitmap, Rectangle);

    return Bitmap;

});
