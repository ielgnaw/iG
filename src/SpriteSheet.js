/**
 * @file 精灵表类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var util = require('./util');
    var Rectangle = require('./Rectangle');

    var floor = Math.floor;

    /**
     * 精灵表基类
     *
     * @constructor
     *
     * @param {Object} opts 参数
     *
     * @return {Object} 当前 SpriteSheet 实例
     */
    function SpriteSheet(opts) {
        opts = opts || {};
        if (!opts.image) {
            throw new Error('SpriteSheet must be require a image param');
        }

        Rectangle.apply(this, arguments);

        util.extend(this, {
            // 一组动画中的所有帧数
            total: 1,
            // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            // 这两个参数对应 drawImage 的 sx, sy
            sX: 0,
            sY: 0,
            // 列数，如果精灵在当前行不是从第 0 列开始的，这个列数也还是指的所有的列数
            // 例如 sprite-sheet3.png 气球图，第一行红球的列数是 16，第二行桔球的列数也是 16
            cols: 0,
            // 行数，当前这组精灵所占的行数
            // 例如 sprite-sheet3.png 气球图，红球的行数数是 2，桔球的行数是 2
            rows: 0,
            // 每帧宽度
            tileW: 0,
            // 每帧高度
            tileH: 0,
            // 横轴偏移
            offsetX: 0,
            // 纵轴偏移
            offsetY: 0,
            // 如果游戏的帧数是 60fps，意味着每 16ms 就执行一帧，这对精灵图来说切换太快，
            // 所以这是这个值来控制精灵切换的速度，
            // 如果设置为 3，那么就代表精灵切换的帧数是 20fps 即每 50ms 切换一次精灵图
            ticksPerFrame: 0,
            // 设为 true 时，那么此 spriteSheet 在一组动画帧执行完成后自动销毁
            isOnce: false,
            // isOnce 为 true 时，一组动画结束后的回调
            onceDone: util.noop
        }, opts);

        // 帧更新的计数器，辅助 ticksPerFrame 计数的
        this.tickUpdateCount = 0;

        // 动画帧的索引
        this.frameIndex = 0;

        // this.sX 的备份，精灵表换行时，sX 从 0 开始
        this.originalSX = this.sX;

        // this.total 的备份，所有精灵表动画跑完后还原到最初状态使用
        this.originalTotal = this.total;

        // 剩下的列数
        // 例如气球图的第二行桔色球，是从第五个球开始的，sX 设置为前四个球的宽度
        // 那么桔色球这行真实的列数是 12，但是换行后，就是整个的列数 16 了
        this.realCols = floor(this.cols - this.sX / this.tileW);

        this.width = this.tileW;
        this.height = this.tileH;

        return this;
    }

    SpriteSheet.prototype = {
        /**
         * 还原 constructor
         */
        constructor: SpriteSheet,

        /**
         * 改变动画帧
         *
         * @param {Object} prop 动画帧属性
         *
         * @return {Object} 当前 SpriteSheet 实例
         */
        changeFrame: function (prop) {
            util.extend(this, {
                // 一组动画中的所有帧数
                total: this.total,
                // 横坐标
                x: this.x,
                // 纵坐标
                y: this.y,
                // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                // 这两个参数对应 drawImage 的 sx, sy
                sX: this.sX,
                sY: this.sY,
                // 列数，如果精灵在当前行不是从第 0 列开始的，这个列数也还是指的所有的列数
                // 例如 sprite-sheet3.png 气球图，第一行红球的列数是 16，第二行桔球的列数也是 16
                cols: this.cols,
                // 行数，当前这组精灵所占的行数
                // 例如 sprite-sheet3.png 气球图，红球的行数数是 2，桔球的行数是 2
                rows: this.rows,
                // 每帧宽度
                tileW: 0,
                // 每帧高度
                tileH: 0,
                // 横轴偏移
                offsetX: 0,
                // 纵轴偏移
                offsetY: 0,
                // 如果游戏的帧数是 60fps，意味着每 16ms 就执行一帧，这对精灵图来说切换太快，
                // 所以这是这个值来控制精灵切换的速度，
                // 如果设置为 3，那么就代表精灵切换的帧数是 20fps 即每 50ms 切换一次精灵图
                ticksPerFrame: this.ticksPerFrame,
                // 设为 true 时，那么此 spriteSheet 在一组动画帧执行完成后自动销毁
                isOnce: false,
                // isOnce 为 true 时，一组动画结束后的回调
                onceDone: util.noop
            }, prop);

            // 帧更新的计数器，辅助 ticksPerFrame 计数的
            this.tickUpdateCount = 0;

            // 动画帧的索引
            this.frameIndex = 0;

            // this.sX 的备份，精灵表换行时，sX 从 0 开始
            this.originalSX = this.sX;

            // this.total 的备份，所有精灵表动画跑完后还原到最初状态使用
            this.originalTotal = this.total;

            // 剩下的列数
            // 例如气球图的第二行桔色球，是从第五个球开始的，sX 设置为前四个球的宽度
            // 那么桔色球这行真实的列数是 12，但是换行后，就是整个的列数 16 了
            this.realCols = floor(this.cols - this.sX / this.tileW);

            this.width = this.tileW;
            this.height = this.tileH;

            // polygon.toPolygon(this);
            // polygon.recalc(this);
            // polygon.getBounds(this);

            return this;
        },

        /**
         * 动画帧更新
         *
         * @return {Object} 当前 SpriteSheet 实例
         */
        _update: function (dt) {
            this.tickUpdateCount++;

            if (this.tickUpdateCount > this.ticksPerFrame) {
                this.tickUpdateCount = 0;

                if (this.frameIndex < this.total - 1) {
                    this.frameIndex++;
                }
                else {
                    // 还原 frameIndex
                    this.frameIndex = 0;

                    // 从头开始，要把帧的总数还原
                    this.total = this.originalTotal;

                    // 还原 sX
                    this.sX = this.originalSX;

                    // 还原 realCols
                    this.realCols = floor(this.cols - this.originalSX / this.tileW);

                    // 还原 sY
                    this.sY -= (this.rows - 1) * this.tileH;

                    if (this.isOnce) {
                        this.status = 5;
                        if (util.getType(this.onceDone) === 'function') {
                            var me = this;
                            setTimeout(function () {
                                me.onceDone(me);
                            }, 100);
                        }
                    }
                }

                // 换行了
                if (this.frameIndex === this.realCols) {

                    // 换行后剩下的帧的总数
                    this.total -= this.realCols;

                    this.frameIndex = 0;

                    // 换行后 sY 要增加一行的高度
                    this.sY += this.tileH;

                    // 换行后 sX 从 0 开始
                    this.sX = 0;

                    this.realCols = this.cols;
                }
            }

            return this;
        },

        /**
         * 动画帧渲染
         *
         * @return {Object} 当前 SpriteSheet 实例
         */
        render: function (offCtx) {
            // polygon.getBounds(this);
            offCtx.save();
            offCtx.globalAlpha = this.alpha;

            SpriteSheet.superClass.render.apply(this, arguments);

            var m = this.matrix.m;
            offCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

            offCtx.drawImage(
                this.image,
                this.frameIndex * this.tileW + this.sX,
                this.sY,
                this.tileW,
                this.tileH,
                this.x + this.offsetX,
                this.y + this.offsetY,
                this.tileW,
                this.tileH
            );

            offCtx.restore();

            return this;
        }

    };

    util.inherits(SpriteSheet, Rectangle);

    return SpriteSheet;
});
