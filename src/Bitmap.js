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
     * @param {Object} opts 参数 x, y, width, height / points
     *                      points 的作用是设置碰撞的那个形状，如果不设置，那么 points 实际上就是 width 和 height 算出来的
     *
     * @return {Object} Bitmap 实例
     */
    function Bitmap(opts) {
        opts = opts || {};
        if (!opts.image) {
            throw new Error('Bitmap must be require a image param');
        }

        Rectangle.call(this, opts);

        this.width = opts.width || this.image.width || 0;
        this.height = opts.height || this.image.height || 0;

        // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        // 这四个参数对应 drawImage 的 sx, sy, sWidth, sHeight
        this.sX = opts.sX || 0;
        this.sY = opts.sY || 0;
        this.sWidth = opts.sWidth || 0;
        this.sHeight = opts.sHeight || 0;

        console.warn(this);

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
         * @param {Object} offCtx 离屏 canvas 2d context 对象
         *
         * @return {Object} 当前 Bitmap 实例
         */
        render: function (offCtx) {
            offCtx.save();

            Bitmap.superClass.render.apply(this, arguments);

            var m = this.matrix.m;
            offCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

            offCtx.drawImage(
                this.image,
                this.sX, this.sY, this.sWidth, this.sHeight,
                this.x, this.y, this.width, this.height
            );

            offCtx.restore();

            return this;
        }
    };

    util.inherits(Bitmap, Rectangle);

    return Bitmap;

});
