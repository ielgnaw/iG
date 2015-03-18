/**
 * @file Ball 基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var util = require('../util');
    var DisplayObject = require('../DisplayObject');

    /**
     * Ball 基类
     *
     * @extends DisplayObject
     * @constructor
     *
     * @param {Object} opts 参数
     */
    function Ball(opts) {
        var me = this;
        DisplayObject.apply(me, arguments);
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
            if (me.x < me.radius || me.x > w - me.radius) {
                me.vX = -me.vX;
            };
            if (me.y < me.radius || me.y > h - me.radius) {
                me.vY = -me.vY;
            }
            me.moveStep();
        },
        render: function(ctx) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.radius - 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.strokeStyle = 'white';
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            Ball.superClass.render.apply(this, arguments);
        }
    }

    util.inherits(Ball, DisplayObject);

    return Ball;

});
