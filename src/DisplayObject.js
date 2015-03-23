/**
 * @file DisplayObject 基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var Event = require('./Event');
    var util = require('./util');

    var guid = 0;

    /**
     * 可显示的对象
     * 这个类是所有可以在场景中显示的对象的基类
     *
     * @constructor
     *
     * @param {Object} opts 配置参数
     * @param {number} opts.x 横坐标，默认 0
     * @param {number} opts.y 纵坐标 0
     * @param {number} opts.width 宽度，默认 0
     * @param {number} opts.height 高度，默认 0
     * @param {number} opts.radius 半径，默认 0，矩形也可以有半径，这时半径是为了当前矩形做圆周运动的辅助
     * @param {number} opts.scaleX 横轴缩放倍数，默认 1
     * @param {number} opts.scaleY 纵轴缩放倍数，默认 1
     * @param {number} opts.angle 旋转角度，这里使用的是角度，canvas 使用的是弧度，默认 1
     * @param {number} opts.alpha 透明度，默认 1
     * @param {number} opts.zIndex 层叠关系，类似 css z-index 概念，默认 0
     * @param {string} opts.fillStyle fill 的样式，如果没有，就用 ctx 的默认的
     * @param {string} opts.strokeStyle stroke 的样式，如果没有，就用 ctx 的默认的
     * @param {Image} opts.image image 图像，这个参数是一个 image 对象
     * @param {number} opts.vX 横轴速度，默认 0
     * @param {number} opts.vY 纵轴速度，默认 0
     * @param {number} opts.aX 横轴加速度，默认 0
     * @param {number} opts.aY 纵轴加速度，默认 0
     * @param {number} opts.frictionX 横轴摩擦力，默认 1
     * @param {number} opts.frictionY 纵轴摩擦力，默认 1
     * @param {boolean} opts.reverseVX 横轴速度相反，为 true 即代表横轴的速度相反，vX = -vX，默认 false
     * @param {boolean} opts.reverseVY 纵轴速度相反，为 true 即代表纵轴的速度相反，vY = -vY，默认 false
     * @param {number} opts.status 当前显示兑现的状态，默认为 1
     *                            1: 可见，每帧需要更新，各种状态都正常
     *                            2: 不可见，每帧需要更新，各种状态都正常
     *                            3: 可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
     *                            4: 不可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
     *                            5: 已经销毁（不可见），不需要更新，也不在整体的 DisplayObject 实例集合中了
     * @param {Object} opts.customProp 自定义的属性
     * @param {boolean} opts.debug 是否开启 debug 模式
     */
    function DisplayObject(opts) {
        var me = this;
        opts = opts || {};
        Event.apply(me, arguments);

        me.name = (opts.name === null || opts.name === undefined) ? ('ig_displayobject_' + (guid++)) : opts.name;

        // 当前 DisplayObject 实例的拥有者，指场景
        me.stageOwner = null;

        // 横坐标
        me.x = opts.x || 0;

        // 纵坐标
        me.y = opts.y || 0;

        // 宽
        me.width = opts.width || 0;

        // 长
        me.height = opts.height || 0;

        // 半径，矩形也可以有半径，这时半径是为了当前矩形做圆周运动的辅助
        me.radius = opts.radius || 0;

        // 横轴缩放倍数
        me.scaleX = opts.scaleX || 1;

        // 纵轴缩放倍数
        me.scaleY = opts.scaleY || 1;

        // 旋转角度，这里使用的是角度，canvas 使用的是弧度
        me.angle = opts.angle || 0;

        // 透明度
        me.alpha = opts.alpha || 1;

        // z-index
        me.zIndex = opts.zIndex || 0;

        // fill 的样式，如果没有，就用 ctx 的默认的
        me.fillStyle = opts.fillStyle || null;

        // stroke 的样式，如果没有，就用 ctx 的默认的
        me.strokeStyle = opts.strokeStyle || null;

        // 图片
        me.image = opts.image || null;

        // 横轴速度，x += vX
        me.vX = opts.vX || 0;

        // 纵轴速度，y += vY
        me.vY = opts.vY || 0;

        // 横轴加速度，vX += aX
        me.aX = opts.aX || 0;

        // 纵轴加速度，vY += aY
        me.aY = opts.aY || 0;

        // 横轴摩擦力
        me.frictionX = opts.frictionX || 1;

        // 纵轴摩擦力
        me.frictionY = opts.frictionY || 1;

        // 横轴相反，为 true 即代表横轴的速度相反，vX = -vX
        me.reverseVX = false;

        // 纵轴相反，为 true 即代表纵轴的速度相反，vY = -vY
        me.reverseVY = false;

        // 当前 DisplayObject 实例的状态
        // 1: 可见，每帧需要更新，各种状态都正常
        // 2: 不可见，每帧需要更新，各种状态都正常
        // 3: 可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
        // 4: 不可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
        // 5: 已经销毁（不可见），不需要更新，也不在整体的 DisplayObject 实例集合中了
        me.status = 1;

        // 自定义的属性
        me.customProp = opts.customProp || {};

        // 当前这个 DisplayObject 实例是否开启 debug 模式
        // 开始 debug 模式即绘制这个 DisplayObject 实例的时候会带上边框
        me.debug = false;

        // 初始化的时候设置位置
        me.setPos(me.x, me.y);

    }

    DisplayObject.prototype = {
        /**
         * 还原 constructor
         */
        constructor: DisplayObject,

        /**
         * 设置位置
         *
         * @param {number} x 横坐标
         * @param {number} y 纵坐标
         */
        setPos: function (x, y) {
            var me = this;
            me.x = x || me.x;
            me.y = y || me.y;
        },

        /**
         * 设置加速度
         *
         * @param {number} x 横向加速度大小
         * @param {number} y 纵向加速度大小
         */
        setAcceleration: function (ax, ay) {
            var me = this;
            me.aX = ax || me.aX;
            me.aY = ay || me.aY;
        },

        /**
         * 设置横轴加速度
         *
         * @param {number} ax 横向加速度大小
         */
        setAccelerationX: function (ax) {
            var me = this;
            me.aX = ax || me.aX;
        },

        /**
         * 设置纵轴加速度
         *
         * @param {number} ay 纵向加速度大小
         */
        setAccelerationY: function (ay) {
            var me = this;
            me.aY = ay || me.aY;
        },

        /**
         * 改变加速度，和设置加速度的区别是
         * 设置加速度是直接设置上去，而改变是基于原加速度的基础上来变化
         *
         * @param {number} x 横向加速度大小
         * @param {number} y 纵向加速度大小
         */
        // changeAcceleration: function (ax, ay) {
        //     var me = this;
        //     me.aX += ax;
        //     me.aY += ay;
        // },

        /**
         * 重置加速度
         */
        resetAcceleration: function () {
            var me = this;
            me.aX = 0;
            me.aY = 0;
        },

        /**
         * 移动
         * x, y 是指要移动的横轴、纵轴距离，而不是终点的横纵坐标
         *
         * @param {number} x 横轴要移动的距离
         * @param {number} y 纵轴要移动的距离
         */
        move: function (x, y) {
            var me = this;
            me.x += x;
            me.y += y;
        },

        /**
         * 移动一步
         * 速度 += 加速度
         * 坐标 += 速度
         */
        moveStep: function () {
            var me = this;
            me.vX += me.aX;
            me.vX *= me.frictionX;
            me.x += me.vX;

            me.vY += me.aY;
            me.vY *= me.frictionY;
            me.y += me.vY;
        },

        /**
         * 设置横轴摩擦力
         *
         * @param {number} frictionX 横轴摩擦力
         */
        setFrictionX: function (frictionX) {
            var me = this;
            me.frictionX = frictionX;
        },

        /**
         * 设置纵轴摩擦力
         *
         * @param {number} frictionY 横轴摩擦力
         */
        setFrictionY: function (frictionY) {
            var me = this;
            me.frictionY = frictionY;
        },

        /**
         * 旋转
         * 这里注意，参数是角度，因此在 canvas 绘制的时候要转成弧度
         *
         * @param {number} angle 旋转的角度
         */
        rotate: function (angle) {
            var me = this;
            var offCtx = me.stageOwner.offCtx;
            offCtx.save();
            offCtx.rotate(util.deg2Rad(me.angle));
            offCtx.restore();
        },

        /**
         * 每帧更新，这个方法应该是由子类重写的
         * `SubClass.superClass.update.apply(sub, arguments);` 可以在子类的实现中要调用此父类方法
         *
         * @override
         */
        update: function () {
           // this.moveStep();
           return true;
        },

        /**
         * 每帧渲染，这个方法应该是由子类重写的
         * `SubClass.superClass.render.apply(sub, arguments);` 可以在子类的实现中要调用此父类方法
         *
         * @param {Object} offCtx 离屏 canvas 2d context 对象
         */
        render: function (offCtx) {
            return true;
            // var me = this;
            // console.warn(me);
            // var me = this;
            // offCtx.save();
            // offCtx.globalAlpha = me.alpha;
            // offCtx.rotate(me.angle * Math.PI / 180);
            // offCtx.translate(me.x * me.scale, me.y * me.scale);
            // me.fire('DisplayObject:render', me);
            // if (me.debug) {
            //     _drawDebugRect.call(me, offCtx);
            // }
            // offCtx.restore();
        },

        /**
         * 和另一个 DisplayObject 实例是否发生碰撞
         *
         * @param {Object} other 另一个 DisplayObject 实例
         *
         * @return {boolean} 是否碰撞结果
         */
        isHit: function (other) {
            var me = this;

            var minX = me.x > other.x ? me.x : other.x;
            var maxX = me.x + me.width < other.x + other.width
                        ? me.x + me.width : other.x + other.width;

            var minY = me.y > other.y ? me.y : other.y;
            var maxY = me.y + me.width < other.y + other.width
                        ? me.y + me.width : other.y + other.width;

            return minX <= maxX && minY <= maxY;
        },

        // 判断鼠标当前坐标是否在当前渲染对象区域中
        isMouseIn: function (pos) {
            var me = this;
            var x = pos.x;
            var y = pos.y;
            var stage = me.stageOwner;
            var stageX = stage.x || 0;
            var stageY = stage.y || 0;
            var hw = 0;
            var hh = 0;
            // debugger
            if (x - stageX >= me.x - me.radius && x - stageX <= me.x + me.radius
                    && y - stageY >= me.y - me.radius && y - stageY <= me.y + me.radius
            ) {
                console.warn('你碰到我了');
            }
        }
    };

    /**
     * 绘制 debug 用的矩形
     *
     * @param {Object} offCtx 离屏 canvas 2d context 对象
     */
    function _drawDebugRect(offCtx) {
        var me = this;
        offCtx.save();
        offCtx.beginPath();
        offCtx.lineWidth = 1;
        offCtx.strokeStyle = '#fff';
        offCtx.globalAlpha = 0.8;
        offCtx.rect(me.x, me.y, me.width, me.height);
        offCtx.closePath();
        offCtx.stroke();
        offCtx.restore();
    }

    util.inherits(DisplayObject, Event);

    return DisplayObject;

});
