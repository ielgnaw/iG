/**
 * @file DisplayObject 基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

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
     * @param {number} opts.scale 缩放倍数，默认 1
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

        // 缩放倍数
        me.scale = opts.scale || 1;

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
        setPos: function (x,y) {
            var me = this;
            me.x = x || me.x;
            me.y = y || me.y;
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
            me.vY += me.aY;

            me.x += me.vX;
            me.y += me.vY;
        },

        /**
         * 旋转
         * 这里注意，参数是角度，因此在 canvas 绘制的时候要转成弧度
         *
         * @param {number} angle 旋转的角度
         */
        rotate: function (angle) {
           this.angle = angle;
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
         * @param {Object} ctx 2d context 对象
         */
        render: function (ctx) {
            return true;
            // var me = this;
            // console.warn(me);
            // var me = this;
            // ctx.save();
            // ctx.globalAlpha = me.alpha;
            // ctx.rotate(me.angle * Math.PI / 180);
            // ctx.translate(me.x * me.scale, me.y * me.scale);
            // me.fire('DisplayObject:render', me);
            // if (me.debug) {
            //     _drawDebugRect.call(me, ctx);
            // }
            // ctx.restore();
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

        //判断鼠标当前坐标是否在当前渲染对象区域中
        isMouseIn: function () {
            var me = this;
            var x = window.aaa.x;
            var y = window.aaa.y;
            var stage = me.stageOwner;
            var stageX = stage.x;
            var stageY = stage.y;
            var hw = 0;
            var hh = 0;
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
     * @param {Object} ctx canvas 2d 上下文对象
     */
    function _drawDebugRect(ctx) {
        var me = this;
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#fff';
        ctx.globalAlpha = 0.8;
        ctx.rect(me.x, me.y, me.width, me.height);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    util.inherits(DisplayObject, Event);

    return DisplayObject;

});
