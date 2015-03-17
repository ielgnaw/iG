/**
 * @file 精灵表类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var util = require('./util');
    var DisplayObject = require('./DisplayObject');

    var guid = 0;

    /**
     * 动画延时计数器
     * window.requestAnimationFrame 速度太快，用这个变量来做延迟
     *
     * @type {number}
     */
    var ANIMATION_DELAY = 0;

    /**
     * 精灵表基类
     *
     * @constructor
     *
     * @param {Object} opts 参数
     */
    function SpriteSheet(opts) {
        opts = opts || {};

        if (!opts.image) {
            throw new Error('SpriteSheet must be require a image param');
        }

        DisplayObject.apply(this, arguments);

        this.name = (opts.name === null || opts.name === undefined) ? 'ig_spritesheet_' + (guid++) : opts.name;

        // 每一帧动画相对于原始图像的裁切 x 位置
        this.relativeX = opts.relativeX || 0;

        // 每一帧动画相对于原始图像的裁切 y 位置
        this.relativeY = opts.relativeY || 0;

        // 每一帧动画的宽度
        this.frameWidth = opts.frameWidth || 32;

        // 每一帧动画的高度
        this.frameHeight = opts.frameHeight || 32;

        // 一组动画中的所有帧数
        this.total = opts.total || 1;

        // 一组动画中的所有帧数的备份
        this.totalBackup = this.total;

        // 当前播放的帧的索引
        this.frameIndex = 0;

        // 帧开始的 x 位置
        this.frameStartX = opts.frameStartX || 0;

        // 帧开始的 x 位置的备份
        this.frameStartXBackup = this.frameStartX;

        // 帧开始的 y 位置
        this.frameStartY = opts.frameStartY || 0;

        // 帧开始的 y 位置的备份
        this.frameStartYBackup = this.frameStartY;

        // 每一帧的偏移量
        this.offsets = opts.offsets;

    }

    var offsetX = 0;
    var offsetY = 0;
    var offsetWidth = 0;
    var offsetHeight = 0;

    SpriteSheet.prototype = {
        /**
         * 还原 constructor
         */
        constructor: SpriteSheet,

        /**
         * 动画帧更新
         */
        update: function () {
            var me = this;
            // if (ANIMATION_DELAY % 7 === 0) {
            //     me.relativeY = me.frameStartY * me.frameHeight;
            //     me.relativeX = me.frameStartX * me.frameWidth + me.frameIndex * me.frameWidth;
            //     me.frameIndex++;
            //     if (me.frameIndex >= me.total) {
            //         me.frameIndex = 0;
            //     }
            // }
            // ANIMATION_DELAY++;

            if (ANIMATION_DELAY % 7 === 0) {

                offsetX = 0;
                offsetY = 0;
                offsetWidth = 0;
                offsetHeight = 0;

                if (me.offsets && me.offsets[me.frameIndex]) {
                    offsetX = me.offsets[me.frameIndex].x || 0;
                    offsetY = me.offsets[me.frameIndex].y || 0;
                    offsetWidth = me.offsets[me.frameIndex].width || 0;
                    offsetHeight = me.offsets[me.frameIndex].height || 0;
                }

                me.relativeX = me.frameStartX * me.frameWidth + me.frameIndex * me.frameWidth + offsetX;
                me.relativeY = me.frameStartY * me.frameHeight + offsetY;
                me.frameIndex++;
                if (me.frameIndex >= me.total) {
                    me.frameIndex = 0;
                    me.frameStartY = me.frameStartYBackup;
                    me.total = me.totalBackup;
                }

                if (me.frameIndex * me.frameWidth >= me.image.width) {
                    me.frameStartY++;
                    me.total = me.total - me.frameIndex;
                    me.frameIndex = 0;
                }
            }
            ANIMATION_DELAY++;
        },

        /**
         * 动画帧渲染
         */
        render: function (offCtx) {
            var me = this;
            offCtx.save();
            offCtx.globalAlpha = me.alpha;
            offCtx.translate(me.x, me.y);
            offCtx.rotate(util.deg2Rad(me.angle));
            offCtx.scale(me.scaleX, me.scaleY);

            // test
            // offCtx.fillRect(-me.frameWidth / 2, -me.frameHeight / 2, me.frameWidth, me.frameHeight);

            offCtx.drawImage(
                // me.image, me.relativeX + offsetX, me.relativeY + offsetY, me.frameWidth + offsetWidth, me.frameHeight + offsetHeight,
                // me.image, me.relativeX, me.relativeY, me.frameWidth, me.frameHeight,
                me.image, me.relativeX, me.relativeY, me.frameWidth + offsetWidth, me.frameHeight + offsetHeight,
                // -me.frameWidth / 2, -me.frameHeight / 2, me.frameWidth, me.frameHeight
                -me.frameWidth / 2, -me.frameHeight / 2, me.frameWidth + offsetWidth, me.frameHeight + offsetHeight
            );
            offCtx.restore();
        }

    };

    util.inherits(SpriteSheet, DisplayObject);

    return SpriteSheet;
});
