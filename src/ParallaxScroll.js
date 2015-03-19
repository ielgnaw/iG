/**
 * @file 视差滚动
 * 实际上是把 canvas 背景作为一个 DisplayObject 来处理
 * 这种情况下 stage.setBgColor 和 stage.setBgImg 是无效的
 *
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var util = require('./util');
    var DisplayObject = require('./DisplayObject');

    var guid = 0;

    /**
     * 作为 repeat 时的新图片
     *
     * @type {Image}
     */
    var newImage4Repeat = new Image();

    /**
     * 视差滚动基类
     *
     * @param {Object} opts 配置参数
     */
    function ParallaxScroll(opts) {
        opts = opts || {};

        if (!opts.image) {
            throw new Error('ParallaxScroll must be require a image param');
        }

        DisplayObject.apply(this, arguments);

        this.name = (opts.name === null || opts.name === undefined) ? ('ig_parallaxscroll_' + (guid++)) : opts.name;

        // 图片
        this.image = opts.image;

        // 是否 repeat
        // 可选值: repeat, repeat-x, repeat-y ，默认 no-repeat
        this.repeat = (opts.repeat && ['repeat', 'repeat-x', 'repeat-y'].indexOf(opts.repeat) !== -1)
            ? opts.repeat : 'no-repeat';
    }

    ParallaxScroll.prototype = {
        /**
         * 还原 constructor
         */
        constructor: ParallaxScroll,

        /**
         * 更新状态
         */
        update: function () {
            var me = this;
            me.vX = (me.vX + me.aX) % me.image.width;
            me.vY = (me.vY + me.aY) % me.image.height;
        },

        /**
         * 渲染
         *
         * @param {Object} offCtx 离屏 canvas 2d context 对象
         */
        render: function (offCtx) {
            var me = this;

            if (me.repeat !== 'no-repeat') {
                _renderRepeatImage.call(me, offCtx);
            }

            var imageWidth = me.image.width;
            var imageHeight = me.image.height;

            var drawArea = {
                width: 0,
                height: 0
            };

            for (var y = 0; y < imageHeight; y += drawArea.height) {
                for (var x = 0; x < imageWidth; x += drawArea.width) {
                    // 从左上角开始画下一个块
                    var newPos = {
                        x: me.x + x,
                        y: me.y + y
                    };

                    // 剩余的绘制空间
                    var newArea = {
                        width: imageWidth - x,
                        height: imageHeight - y
                    };

                    var newScrollPos = {
                        x: 0,
                        y: 0
                    };

                    if (x === 0) {
                        newScrollPos.x = me.vX;
                    }

                    if (y === 0) {
                        newScrollPos.y = me.vY;
                    }
                    drawArea = _drawScroll.call(me, offCtx, newPos, newArea, newScrollPos, imageWidth, imageHeight);
                }
            }
        }
    };

    /**
     * 绘制滚动的区域
     *
     * @param {Object} offCtx 离屏 canvas 2d context 对象
     * @param {Object} newPos 新的绘制的起点坐标对象
     * @param {Object} newArea 新绘制区域的大小对象
     * @param {Object} newScrollPos 滚动的区域起点的坐标对象
     * @param {number} imageWidth 图片宽度
     * @param {number} imageHeight 图片高度
     *
     * @return {Object} 待绘制区域的宽高
     */
    function _drawScroll(offCtx, newPos, newArea, newScrollPos, imageWidth, imageHeight) {
        var me = this;
        var xOffset = Math.abs(newScrollPos.x) % imageWidth;
        var yOffset = Math.abs(newScrollPos.y) % imageHeight;
        var left = newScrollPos.x < 0 ? imageWidth - xOffset : xOffset;
        var top = newScrollPos.y < 0 ? imageHeight - yOffset : yOffset;
        var width = newArea.width < imageWidth - left ? newArea.width : imageWidth - left;
        var height = newArea.height < imageHeight - top ? newArea.height : imageHeight - top;

        offCtx.drawImage(me.image, left, top, width, height, newPos.x, newPos.y, width, height);

        return {
            width: width,
            height: height
        };
    }

    /**
     * 绘制 repeat, repeat-x, repeat-y
     *
     * @param {Object} offCtx 离屏 canvas 2d context 对象
     */
    function _renderRepeatImage(offCtx) {
        var me = this;
        offCtx.save();
        offCtx.fillStyle = offCtx.createPattern(me.image, me.repeat);
        offCtx.fillRect(me.x, me.y, offCtx.canvas.width, offCtx.canvas.height);
        offCtx.restore();

        if (!newImage4Repeat.src) {
            newImage4Repeat.src = offCtx.canvas.toDataURL();
            me.image = newImage4Repeat;
        }
    }

    util.inherits(ParallaxScroll, DisplayObject);

    return ParallaxScroll;

});
