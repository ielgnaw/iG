/**
 * @file 位图精灵，这个精灵承载一个静态的图片
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var util = require('./util');
    var DisplayObject = require('./DisplayObject');
    var polygon = require('./geom/polygon');

    /**
     * Bitmap 基类
     *
     * @extends DisplayObject
     * @constructor
     *
     * @param {Object} opts 参数 x, y, width, height / points
     *                      points 的作用是设置碰撞的那个形状，如果不设置，那么 points 实际上就是 width 和 height 算出来的
     */
    function Bitmap(opts) {
        opts = opts || {};

        if (!opts.image) {
            throw new Error('Bitmap must be require a image param');
        }

        DisplayObject.apply(this, arguments);

        // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        // 这四个参数对应 drawImage 的 sx, sy, sWidth, sHeight
        this.sX = opts.sX || 0;
        this.sY = opts.sY || 0;
        this.sWidth = opts.sWidth || 0;
        this.sHeight = opts.sHeight || 0;

        this.width = opts.width || this.image.width || 0;
        this.height = opts.height || this.image.height || 0;

        // 如果传入了 points，那么就是用 Polygon，否则用 Rect
        if (opts.points && opts.points.length && util.getType(opts.points) === 'array') {
            this.points = opts.points;
        }
        else {
            polygon.toPolygon(this);
        }

        polygon.recalc(this);
        polygon.getBounds(this);
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
            polygon.getBounds(this);
            offCtx.save();
            offCtx.drawImage(
                this.image,
                this.sX, this.sY, this.sWidth || this.width, this.sHeight || this.height,
                this.x, this.y, this.width, this.height
            );
            this.debugRender(offCtx);
            offCtx.restore();

            return this;
        },

        /**
         * 某个点是否和矩形相交
         *
         * @param {number} x 点的横坐标
         * @param {number} y 点的纵坐标
         *
         * @return {boolean} 是否相交
         */
        hitTestPoint: function (x, y) {
            return x >= this.bounds.x && x <= this.bounds.x + this.bounds.width
                    && y >= this.bounds.y && y <= this.bounds.y + this.bounds.height;
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

    util.inherits(Bitmap, DisplayObject);

    return Bitmap;

});
