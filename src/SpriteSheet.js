/**
 * @file 精灵表类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var util = require('./util');
    var DisplayObject = require('./DisplayObject');
    var polygon = require('./geom/polygon');
    var collision = require('./collision');

    var floor = Math.floor;

    var guid = 0;

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

        DisplayObject.apply(this, arguments);

        util.extend(this, {
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
            isOnce: false

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

        if (opts.points && opts.points.length && util.getType(opts.points) === 'array') {
            this.points = opts.points;
        }
        else {
            polygon.toPolygon(this);
        }

        polygon.recalc(this);
        polygon.getBounds(this);

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
                isOnce: false
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

            polygon.toPolygon(this);
            polygon.recalc(this);
            polygon.getBounds(this);

            return this;
        },

        /**
         * 动画帧更新
         *
         * @return {Object} 当前 SpriteSheet 实例
         */
        update: function (dt) {
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
            polygon.getBounds(this);
            offCtx.save();

            offCtx.globalAlpha = this.alpha;
            offCtx.translate(this.x, this.y);
            offCtx.rotate(util.deg2Rad(this.angle));
            offCtx.scale(this.scaleX, this.scaleY);
            offCtx.translate(-this.x, -this.y);

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
            this.debugRender(offCtx);

            // test
            // offCtx.fillRect(100, 0, 100, 100);

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
            return collision.checkPointPolygon({x: x, y: y}, this);
            // return x >= this.bounds.x && x <= this.bounds.x + this.bounds.width
                    // && y >= this.bounds.y && y <= this.bounds.y + this.bounds.height;
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
                var points = this.points;
                var i = points.length;

                offCtx.translate(this.x, this.y);
                offCtx.beginPath();
                offCtx.moveTo(points[0].x, points[0].y);
                while (i--) {
                    offCtx.lineTo(points[i].x, points[i].y);
                }
                offCtx.closePath();
                offCtx.stroke();
                offCtx.translate(-this.x, -this.y);

                // offCtx.strokeRect(
                //     this.bounds.x,
                //     this.bounds.y,
                //     this.bounds.width,
                //     this.bounds.height
                // );

                offCtx.restore();
            }
        }

    };

    util.inherits(SpriteSheet, DisplayObject);

    return SpriteSheet;
});
