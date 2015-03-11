/**
 * @file DisplayObject 类
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
     */
    function DisplayObject(opts) {
        Event.apply(this, arguments);

        opts = opts || {};
        this.name = (opts.name === null || opts.name === undefined) ? ('ig_displayobject_' + (guid++)) : opts.name;

        // 当前 DisplayObject 实例的拥有者，指场景
        this.stageOwner = null;

        // 横坐标
        this.x = opts.x || 0;
        // 纵坐标
        this.y = opts.y || 0;
        // 宽
        this.width = opts.width || 20;
        // 长
        this.height = opts.height || 20;
        // 横轴速度，x += vX
        this.vX = opts.vX || 0;
        // 纵轴速度，y += vY
        this.vY = opts.vY || 0;
        // 横轴加速度，vX += aX
        this.aX = opts.aX || 0;
        // 纵轴加速度，vY += aY
        this.aY = opts.aY || 0;
        // 横轴相反，为 true 即代表横轴的速度相反，vX = -vX
        this.reverseX = false;
        // 纵轴相反，为 true 即代表纵轴的速度相反，vY = -vY
        this.reverseY = false;
        // 透明度
        this.alpha = opts.alpha || 1;
        // 缩放倍数
        this.scale = opts.scale || 1;
        // 旋转角度，这里使用的是角度，canvas 使用的是弧度
        this.angle = opts.angle || 0;
        // 半径，矩形也可以有半径，这时半径是为了当前矩形做圆周运动的辅助
        this.radius = Math.random() * 30;
        // z-index
        this.zIndex = opts.zIndex || 0;
        // 图片
        this.image = opts.image || null;

        // 当前 DisplayObject 实例的状态
        // 1: 可见，每帧需要更新，各种状态都正常
        // 2: 不可见，每帧需要更新，各种状态都正常
        // 3: 可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
        // 4: 不可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
        // 5: 已经销毁（不可见），不需要更新，也不在整体的 DisplayObject 实例集合中了
        this.status = 1;

        // 自定义的属性
        this.customProp = opts.customProp || {};

        // 当前这个 DisplayObject 实例是否开启 debug 模式
        // 开始 debug 模式即绘制这个 DisplayObject 实例的时候会带上边框
        this.debug = false;
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
            this.x += x;
            this.y += y;
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
         * 每帧更新
         */
        update: function () {
           this.moveStep();
        },

        /**
         * 每帧渲染，由子类调用，子类也可以调用这个父类的方法
         *
         * @param {Object} ctx 2d context 对象
         */
        render: function (ctx) {
            var me = this;
            ctx.save();
            ctx.globalAlpha = me.alpha;
            ctx.rotate(me.angle * Math.PI / 180);
            ctx.translate(me.x * me.scale, me.y * me.scale);
            me.fire('DisplayObject:render', me);
            if (me.debug) {
                _drawDebugRect.call(me, ctx);
            };
            ctx.restore();
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
