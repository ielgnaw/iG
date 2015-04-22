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

        Polygon.call(this, opts);

        util.extend(true, this, {
            // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            // 这四个参数对应 drawImage 的 sx, sy, sWidth, sHeight
            sX: 0,
            sY: 0,
            sWidth: 0,
            sHeight: 0
        }, opts);

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
         * @param {Object} offCtx 离屏 canvas 2d context 对象
         *
         * @return {Object} 当前 BitmapPolygon 实例
         */
        render: function (offCtx) {
            offCtx.save();

            BitmapPolygon.superClass.render.apply(this, arguments);


            var m = this.matrix.m;
            offCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

            offCtx.drawImage(
                this.image,
                this.sX, this.sY, this.sWidth, this.sHeight,
                this.x, this.y, this.bounds.width, this.bounds.height
            );

            offCtx.restore();

            return this;
        }
    };

    util.inherits(BitmapPolygon, Polygon);

    return BitmapPolygon;

});
