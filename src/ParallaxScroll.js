/**
 * @file 视差滚动
 * 实际上是把 canvas 背景作为一个 DisplayObject 来处理
 * 这种情况下 stage.setContainerBgColor 和 stage.setContainerBgImg 是无效的
 *
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var util = require('./util');
    var DisplayObject = require('./DisplayObject');

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

        // 图片
        this.image = opts.image;

        // 是否 repeat
        // 可选值: repeat, repeat-x, repeat-y ，默认 no-repeat
        this.repeat = opts.repeat || 'no-repeat';

        // 滚动加速度
        // this.scrollSpeed = opts.scrollSpeed;

        // this.vX = opts.vX || 0;
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
         * @param {Object} ctx 2d context 对象
         */
        render: function (ctx) {
            var me = this;
            var canvasWidth = ctx.canvas.width;
            var canvasHeight = ctx.canvas.height;

            if (me.repeat !== 'no-repeat') {
                _renderRepeatImage.call(me, ctx);
            }
            // console.warn(me.vX);
            // 滚动距离已经超出图片宽度
            if (me.vX + canvasWidth > me.image.width) {
                var d0 = me.image.width - me.vX;
                var d1 = canvasWidth - d0;

                ctx.drawImage(me.image, me.vX, me.vY, d0, me.image.height, me.x, me.y, d0, me.image.height);
                ctx.drawImage(me.image, 0, me.vY, d1, me.image.height, me.x + d0, me.y, d1, me.image.height);

                ctx.drawImage(me.image, 0, 0, d1, me.image.height, me.x + d0, me.image.height - me.vY, d1, me.image.height);
            }

            if (me.vY + canvasHeight > me.image.height) {
                var d0 = me.image.height - me.vY;
                var d1 = canvasHeight - d0;
                ctx.drawImage(me.image, me.vX, me.vY, me.image.width, d0, me.x, me.y, me.image.width, d0);
                ctx.drawImage(me.image, me.vX, 0, me.image.width, d1, me.x, me.y + d0, me.image.width, d1);

                ctx.drawImage(me.image, 0, 0, me.image.width, d1, me.image.width - me.vX, me.y + d0, me.image.width, d1);
            }

            ctx.drawImage(me.image, me.vX, me.vY, canvasWidth, me.image.height, me.x, me.y, canvasWidth, me.image.height);
        }
    }

    function _renderRepeatImage(ctx) {
        var me = this;
        ctx.save();
        ctx.fillStyle = ctx.createPattern(me.image, me.repeat);
        ctx.fillRect(me.x, me.y, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
        if (!newImage4Repeat.src) {
            newImage4Repeat.src = canvas.toDataURL();
            me.image = newImage4Repeat;
        }
    }

    util.inherits(ParallaxScroll, DisplayObject);

    return ParallaxScroll;

});
