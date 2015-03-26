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

            me.bBox.x = me.x;
            me.bBox.y = me.y;
        },
        render: function (ctx) {
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // console.warn(this.bBox);
            this.bBox.color = 'red';
            this.checkCollide();

            this.bBox.show(ctx);
        },
        setBBox: function (bBox) {
           this.bBox = bBox;
        },
        checkCollide:function () {
            var me = this;
            var displayObjectList = me.stageOwner.displayObjectList;
            var length = displayObjectList.length;
            for (var i = 0; i < length; i++) {
                if (me.name !== displayObjectList[i].name
                    && me.bBox.isCollide(displayObjectList[i].bBox)
                    && me.bBox.color !== 'yellow'
                ) {
                    console.warn(1);
                    me.bBox.color = 'yellow';
                    displayObjectList[i].bBox.color = 'yellow';
                }
                // else {
                //     me.bBox.color = me.color;
                //     displayObjectList[i].bBox.color = me.color;
                // }
            }
        }
    }

    util.inherits(Ball, DisplayObject);

    return Ball;

});
