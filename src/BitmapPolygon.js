/**
 * @file 位图精灵（多边形），这个精灵承载一个静态的图片
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var util = require('./util');
    var Polygon = require('./Polygon');

    /**
     * BitmapPolygon 基类
     *
     * @extends DisplayObject
     * @constructor
     *
     * @param {Object} opts 参数
     *
     * @return {Object} BitmapPolygon 实例
     */
    function BitmapPolygon(opts) {
        opts = opts || {};
        if (!opts.image) {
            throw new Error('BitmapPolygon must be require a image param');
        }

        util.extend(true, this, {
            // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            // 这四个参数对应 drawImage 的 sx, sy, sWidth, sHeight
            sx: 0,
            sy: 0,
            sWidth: 0,
            sHeight: 0
        }, opts);

        Polygon.call(this, opts);

        return this;
    }

    BitmapPolygon.prototype = {
        /**
         * 还原 constructor
         */
        constructor: BitmapPolygon,

        /**
         * 渲染当前 BitmapPolygon 实例
         *
         * @param {Object} ctx canvas 2d context 对象
         *
         * @return {Object} 当前 BitmapPolygon 实例
         */
        render: function (ctx) {
            ctx.save();

            _setInitDimension.call(this);

            BitmapPolygon.superClass.render.apply(this, arguments);
            this.matrix.setCtxTransform(ctx);
            // console.warn(this.x, this.y, this.width, this.height);
            ctx.drawImage(
                this.asset,
                this.sx, this.sy, this.sWidth, this.sHeight,
                this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height
            );

            ctx.restore();

            return this;
        }
    };

    /**
     * 设置 BitmapPolygon 实例的 sWidth, sHeight
     * 由于在实例化 Bitmap 的时候，图片资源还没有加载完成
     * 只有在 render 的时候才能获取到图片的 asset，这个时候去设置当前 Bitmap 实例的 sWidth 等
     */
    function _setInitDimension() {
        if (!this._.isInitDimension) {
            this._.isInitDimension = true;

            if (this.sWidth === 0) {
                this.sWidth = this.asset.width;
            }

            if (this.sHeight === 0) {
                this.sHeight = this.asset.height;
            }
        }
    }


    util.inherits(BitmapPolygon, Polygon);

    return BitmapPolygon;

});
