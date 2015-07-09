/**
 * @file 精灵表类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var util = require('./util');
    var Rectangle = require('./Rectangle');

    var STATUS = ig.getConfig('status');

    var floor = Math.floor;

    /**
     * 精灵表基类，精灵表由于每帧都在变化，因此不存在 useCache 了
     *
     * @constructor
     *
     * @param {Object} opts 参数
     *
     * @return {Object} 当前 SpriteSheet 实例
     */
    function SpriteSheet(opts) {
        opts = opts || {};
        if (!opts.image && !opts.asset) {
            throw new Error('SpriteSheet must be require a image param');
        }

        Rectangle.apply(this, opts);

        util.extend(this, {
            // 跳帧的个数，可以用来设置延迟
            // 如果帧数是 60fps，意味着每 1000 / 60 = 16ms 就执行一帧，
            // 如果设置为 3，那么就代表每 3 * 16 = 48ms 执行一次，帧数为 1000 / 48 = 20fps
            jumpFrames: 0,
            // 设为 true 时，那么此 spriteSheet 在一组动画帧执行完成后自动销毁
            isOnce: false,
            // isOnce 为 true 时，一组动画结束后的回调
            onceDone: util.noop
        }, opts);

        // 帧更新的计数器，辅助 jumpFrames 计数的
        this.frameUpdateCount = 0;

        // 动画帧的索引
        this.frameIndex = 0;
        return this;
    }

    SpriteSheet.prototype = {
        /**
         * 还原 constructor
         */
        constructor: SpriteSheet,

        /**
         * 改变动画，如果 prop 为空对象，那么结果是当前的 asset 的第一帧，帧也不会再变化了。
         * 这也是 total, sx, sy, cols, rows 设置为固定值的原因
         *
         * @param {Object} prop 变化的属性
         *
         * @return {Object} SpriteSheet 实例
         */
        change: function (prop) {
            prop = prop || {};
            util.extend(this, {
                asset: this.asset,
                // 横坐标
                x: this.x,
                // 纵坐标
                y: this.y,
                width: this.width,
                height: this.height,
                // 一组动画中的所有帧数
                total: 1,
                // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                // 这两个参数对应 drawImage 的 sx, sy
                sx: 0,
                sy: 0,
                // 列数，如果精灵在当前行不是从第 0 列开始的，这个列数也还是指的所有的列数
                // 例如 sprite-sheet3.png 气球图，第一行红球的列数是 16，第二行桔球的列数也是 16
                cols: 1,
                // 行数，当前这组精灵所占的行数
                // 例如 sprite-sheet3.png 气球图，红球的行数数是 2，桔球的行数是 2
                rows: 1,
                // 每帧宽度
                tileW: this.tileW,
                // 每帧高度
                tileH: this.tileH,
                // 横轴偏移
                offsetX: this.offsetX,
                // 纵轴偏移
                offsetY: this.offsetY,
                // 跳帧的个数，可以用来设置延迟
                // 如果帧数是 60fps，意味着每 1000 / 60 = 16ms 就执行一帧，
                // 如果设置为 3，那么就代表每 3 * 16 = 48ms 执行一次，帧数为 1000 / 48 = 20fps
                jumpFrames: this.jumpFrames,
                // 设为 true 时，那么此 spriteSheet 在一组动画帧执行完成后自动销毁
                isOnce: false,
                // isOnce 为 true 时，一组动画结束后的回调
                onceDone: util.noop
            }, prop);

            // 帧更新的计数器，辅助 jumpFrames 计数的
            this.frameUpdateCount = 0;

            // 动画帧的索引
            this.frameIndex = 0;

            // this.sx 的备份，精灵表换行时，sx 从 0 开始
            this.originalSX = this.sx;

            // this.total 的备份，所有精灵表动画跑完后还原到最初状态使用
            this.originalTotal = this.total;

            // 剩下的列数
            // 例如气球图的第二行桔色球，是从第五个球开始的，sx 设置为前四个球的宽度
            // 那么桔色球这行真实的列数是 12，但是换行后，就是整个的列数 16 了
            this.realCols = floor(this.cols - this.sx / this.tileW);

            this.width = this.width || this.tileW;
            this.height = this.height || this.tileH;

            return this;
        },

        /**
         * 动画帧更新
         *
         * @param {number} dt 毫秒，固定的时间片
         * @param {number} stepCount 每帧中切分出来的每个时间片里执行的函数的计数器
         * @param {number} requestID requestAnimationFrame 标识
         *
         * @return {Object} SpriteSheet 实例
         */
        _step: function (dt, stepCount, requestID) {
            this.frameUpdateCount++;

            if (this.frameUpdateCount > this.jumpFrames) {
                this.frameUpdateCount = 0;

                // if (this.frameIndex < this.total - 1) {
                if (this.frameIndex < this.total - 1) {
                    this.frameIndex++;
                }
                else {
                    // 还原 frameIndex
                    this.frameIndex = 0;

                    // 从头开始，要把帧的总数还原
                    this.total = this.originalTotal;

                    // 还原 sx
                    this.sx = this.originalSX;

                    // 还原 realCols
                    this.realCols = floor(this.cols - this.originalSX / this.tileW);

                    // 还原 sy
                    this.sy -= (this.rows - 1) * this.tileH;

                    if (this.isOnce) {
                        this.status = STATUS.DESTROYED;
                        if (util.getType(this.onceDone) === 'function') {
                            var me = this;
                            setTimeout(function () {
                                me.onceDone(me);
                            }, 10);
                        }
                    }
                }

                // 换行了
                if (this.frameIndex === this.realCols) {

                    // 换行后剩下的帧的总数
                    this.total -= this.realCols;

                    this.frameIndex = 0;

                    // 换行后 sy 要增加一行的高度
                    this.sy += this.tileH;

                    // 换行后 sx 从 0 开始
                    this.sx = 0;

                    this.realCols = this.cols;
                }
            }

            return this;
        },

        /**
         * 动画帧渲染
         *
         * @param {Object} ctx canvas 2d context 对象
         *
         * @return {Object} SpriteSheet 实例
         */
        render: function (ctx) {
            _setup.call(this);

            ctx.save();
            ctx.fillStyle = this.fillStyle;
            ctx.strokeStyle = this.strokeStyle;
            ctx.globalAlpha = this.alpha;

            SpriteSheet.superClass.render.apply(this, arguments);
            this.matrix.setCtxTransform(ctx);

            ctx.drawImage(
                this.asset,
                this.frameIndex * this.tileW + this.sx,
                this.sy,
                this.tileW,
                this.tileH,
                this.x + this.offsetX * this.game.ratioX,
                this.y + this.offsetY * this.game.ratioY,
                // this.tileW,
                // this.tileH
                this.width,
                this.height
            );

            ctx.restore();

            return this;
        }
    };

    /**
     * 内部初始化
     *
     * @return {Object} SpriteSheet 实例
     */
    function _setup() {
        if (!this._.isSetup) {
            this._.isSetup = true;

            var curSheetData = null;

            var sheetKey = this.sheetKey;
            // this.sheetData 的情况是 直接在 SpriteSheet 的构造中传入 sheetData
            if (this.sheetData) {
                if (this.sheetData[sheetKey]) {
                    curSheetData = this.sheetData[sheetKey];
                }
                else {
                    curSheetData = this.sheetData;
                }
            }

            if (!curSheetData) {
                return;
            }

            util.extend(this, {
                // 一组动画中的所有帧的总数
                total: 1,
                // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                // 这两个参数对应 drawImage 的 sx, sy
                sx: 0,
                sy: 0,
                // 列数，如果精灵在当前行不是从第 0 列开始的，这个列数也还是指的所有的列数
                // 例如 sprite-sheet1.png 气球图，第一行红球的列数是 16，第二行桔球的列数也是 16
                cols: 0,
                // 行数，当前这组精灵所占的行数
                // 例如 sprite-sheet1.png 气球图，红球的行数数是 2，桔球的行数是 2
                rows: 0,
                // 每帧宽度
                tileW: 0,
                // 每帧高度
                tileH: 0,
                // 横轴偏移
                offsetX: 0,
                // 纵轴偏移
                offsetY: 0
            }, curSheetData);

            // this.sx 的备份，精灵表换行时，sx 从 0 开始
            this.originalSX = this.sx;

            // this.total 的备份，所有精灵表动画跑完后还原到最初状态使用
            this.originalTotal = this.total;

            // 剩下的列数
            // 例如气球图的第二行桔色球，是从第五个球开始的，sx 设置为前四个球的宽度
            // 那么桔色球这行真实的列数是 12，但是换行后，就是整个的列数 16 了
            this.realCols = floor(this.cols - this.sx / this.tileW);

            this.width = this.width || this.tileW;
            this.height = this.height || this.tileH;
        }
        return this;
    }

    util.inherits(SpriteSheet, Rectangle);

    return SpriteSheet;
});
