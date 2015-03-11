/**
 * @file Ball 类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var util = require('../util');
    var DisplayObject = require('../DisplayObject');

    /**
     * Ball 类
     *
     * @extends DisplayObject
     * @constructor
     *
     * @param {Object} opts 参数
     */
    function Ball(opts) {
        var me = this;
        DisplayObject.apply(me, arguments);
        me.r = opts.r || 10;
        me.color = '#fff';
    }

    Ball.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Ball,
        update: function () {
            var me = this;
            var w = me.stageOwner.width;
            var h = me.stageOwner.height;
            if (me.x < me.r || me.x > w - me.r) {
                me.vX = -me.vX;
            };
            if (me.y < me.r || me.y > h - me.r) {
                me.vY = -me.vY;
            }
            // me.moveStep();
            Ball.superClass.update.call(me);
            // this.constructor.prototype.update();
        },
        render: function(ctx) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.r - 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.strokeStyle = 'white';
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.stroke();
            Ball.superClass.render.apply(this, arguments);
        }
    }

    util.inherits(Ball, DisplayObject);

    return Ball;

});
