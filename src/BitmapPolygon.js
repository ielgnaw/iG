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
     * 改变图片的显示大小可以设置 width, height 属性，points 属性形状的大小
     * Bitmap 和 BitmapPolygon 的区别是，Bitmap 的形状大小跟 width 和 height 属性一致
     * 而 BitmapPolygon 可以通过 points 自由的设置形状大小
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
            sHeight: 0,

            // 是否使用缓存
            useCache: true
        }, opts);

        Polygon.call(this, opts);

        this.getOriginBounds();

        return this;
    }

    BitmapPolygon.prototype = {
        /**
         * 还原 constructor
         */
        constructor: BitmapPolygon,

        /**
         * 初始化缓存 canvas
         *
         * @return {Object} Bitmap 实例
         */
        initCacheCanvas: function () {
            if (!this.cacheCanvas) {
                this.cacheCanvas = document.createElement('canvas');
                this.cacheCtx = this.cacheCanvas.getContext('2d');
            }
            this.cacheCanvas.width = this.width;
            this.cacheCanvas.height = this.height;
            this.cache();
            return this;
        },

        /**
         * 缓存，把需要重复绘制的画面数据进行缓存起来，减少调用 canvas API 的消耗
         *
         * @return {Object} Bitmap 实例
         */
        cache: function () {
            this.cacheCtx.save();
            this.cacheCtx.drawImage(
                this.asset,
                this.sx, this.sy, this.sWidth, this.sHeight,
                0, 0, this.width, this.height
            );
            this.cacheCtx.restore();
            return this;
        },

        /**
         * 渲染当前 BitmapPolygon 实例
         *
         * @param {Object} ctx canvas 2d context 对象
         *
         * @return {Object} 当前 BitmapPolygon 实例
         */
        render: function (ctx) {
            _setInitDimension.call(this);

            ctx.save();

            ctx.fillStyle = this.fillStyle;
            ctx.strokeStyle = this.strokeStyle;
            ctx.globalAlpha = this.alpha;

            this.matrix.reset();
            this.matrix.translate(this.cx, this.cy);
            this.matrix.rotate(this.angle);
            this.matrix.scale(this.scaleX, this.scaleY);
            this.matrix.translate(-this.cx, -this.cy);
            this.matrix.setCtxTransform(ctx);

            if (this.useCache) {
                if (!this._.execCache) {
                    this._.execCache = true;
                    this.initCacheCanvas();
                }
                ctx.drawImage(this.cacheCanvas, this.x, this.y);
            }
            else {
                ctx.drawImage(
                    this.asset,
                    this.sx, this.sy, this.sWidth, this.sHeight,
                    this.x, this.y, this.width, this.height
                );
            }

            this.generatePoints();
            this.getBounds();
            this.createPath(ctx);

            ctx.fill();
            ctx.stroke();

            ctx.restore();

            this.debugRender(ctx);

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

            if (this.width === 0) {
                this.width = this.asset.width;
            }

            if (this.height === 0) {
                this.height = this.asset.height;
            }

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
