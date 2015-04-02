/**
 * @file 精灵表类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var util = require('./util');
    var DisplayObject = require('./DisplayObject');

    var floor = Math.floor;

    var guid = 0;

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

        this.p = util.extend({
            name: 'ig_spritesheet_' + (guid++),

            // 一组动画中的所有帧数
            total: 1,

            // 横坐标
            x: 0,

            // 纵坐标
            y: 0,

            // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            // 这两个参数对应 drawImage 的 sx, sy
            sX: 0,
            sY: 0,

            // 列数，如果精灵在当前行不是从第 0 列开始的，这个列数也还是指的所有的列数
            // 例如 sprite-sheet3.png 气球图，第一行红球的列数是 16，第二行桔球的列数也是 16
            cols: 0,

            // 行数
            // 例如 sprite-sheet3.png 气球图，红球的行数数是 2，桔球的行数是 2
            rows: 0,

            // 如果游戏的帧数是 60fps，意味着每 16ms 就执行一帧，这对精灵图来说切换太快，
            // 所以这是这个值来控制精灵切换的速度，
            // 如果设置为 3，那么就代表精灵切换的帧数是 20fps 即每 50ms 切换一次精灵图
            ticksPerFrame: 0
        }, opts);

        // 帧更新的计数器，辅助 ticksPerFrame 计数的
        this.tickUpdateCount = 0;

        // 动画帧的索引
        this.frameIndex = 0;

        // this.p.sX 的备份，精灵表换行时，sX 从 0 开始
        this.originalSX = this.p.sX;

        // this.p.total 的备份，所有精灵表动画跑完后还原到最初状态使用
        this.originalTotal = this.p.total;

        // 剩下的列数
        // 例如气球图的第二行桔色球，是从第五个球开始的，sX 设置为前四个球的宽度
        // 那么桔色球这行真实的列数是 12，但是换行后，就是整个的列数 16 了
        this.realCols = floor(this.p.cols - this.p.sX / this.p.tileW);

        console.warn(this);
    }

    SpriteSheet.prototype = {
        /**
         * 还原 constructor
         */
        constructor: SpriteSheet,

        /**
         * 动画帧更新
         */
        update: function (dt) {
            this.tickUpdateCount++;

            if (this.tickUpdateCount > this.p.ticksPerFrame) {
                this.tickUpdateCount = 0;

                if (this.frameIndex < this.p.total - 1) {
                    this.frameIndex++;
                }
                else {
                    // 还原 frameIndex
                    this.frameIndex = 0;

                    // 从头开始，要把帧的总数还原
                    this.p.total = this.originalTotal;

                    // 还原 sX
                    this.p.sX = this.originalSX;

                    // 还原 realCols
                    this.realCols = floor(this.p.cols - this.originalSX / this.p.tileW);

                    // 还原 sY
                    this.p.sY -= (this.p.rows - 1) * this.p.tileH;
                }

                // 换行了
                if (this.frameIndex === this.realCols) {

                    // 换行后剩下的帧的总数
                    this.p.total -= this.realCols;

                    this.frameIndex = 0;

                    // 换行后 sY 要增加一行的高度
                    this.p.sY += this.p.tileH;

                    // 换行后 sX 从 0 开始
                    this.p.sX = 0;

                    this.realCols = this.p.cols;
                }
            }

        },

        /**
         * 动画帧渲染
         */
        render: function (offCtx) {
            offCtx.save();

            offCtx.globalAlpha = this.alpha;
            offCtx.translate(this.x, this.y);
            offCtx.rotate(util.deg2Rad(this.angle));
            offCtx.scale(this.scaleX, this.scaleY);
            offCtx.translate(-this.x, -this.y);

            var p = this.p;
            // console.warn(p.sY);
            offCtx.drawImage(
                p.image,
                this.frameIndex * p.tileW + p.sX,
                p.sY,
                p.tileW,
                p.tileH,
                p.x,
                p.y,
                p.tileW,
                p.tileH
            );

            // test
            // offCtx.fillRect(100, 0, 100, 100);

            offCtx.restore();
        }

    };

    util.inherits(SpriteSheet, DisplayObject);

    return SpriteSheet;
});
