/**
 * @file DisplayObject 基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var Event = require('./Event');
    var util = require('./util');
    var Animation = require('./Animation');
    var ig = require('./ig');
    var Matrix = require('./Matrix');

    var STATUS = ig.STATUS;

    /**
     * 名字标示
     *
     * @type {number}
     */
    var GUID_KEY = 0;

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
     * @param {number} opts.cX 中心店横坐标，默认 0
     * @param {number} opts.cY 中心店纵坐标 0
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
     * @param {number} opts.status 当前显示兑现的状态，默认为 1
     *                            1: 可见，每帧需要更新，各种状态都正常
     *                            2: 不可见，每帧需要更新，各种状态都正常
     *                            3: 可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
     *                            4: 不可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
     *                            5: 已经销毁（不可见），不需要更新，也不在整体的 DisplayObject 实例集合中了
     * @param {Object} opts.customProp 自定义的属性
     * @param {boolean} opts.debug 是否开启 debug 模式
     *
     * @return {Object} DisplayObject 实例
     */
    function DisplayObject(opts) {
        util.extend(true, this, {
            // 名称
            name: 'ig_displayobject_' + (GUID_KEY++),
            // 横坐标
            x: 0,
            // 纵坐标
            y: 0,
            // 宽度
            width: 0,
            // 高度
            height: 0,
            // 中心点横坐标
            cX: 0,
            // 中心点纵坐标
            cY: 0,
            // 半径
            radius: 0,
            // 横轴缩放倍数
            scaleX: 1,
            // 纵轴缩放倍数
            scaleY: 1,
            // 旋转角度
            angle: 0,
            // 透明度
            alpha: 1,
            // 层叠关系
            zIndex: 0,
            // fill 的样式
            fillStyle: 'transparent',
            // stroke 的样式
            strokeStyle: 'transparent',
            // image 图像
            image: null,
            // 横轴速度，x += vX
            vX: 0,
            // 纵轴速度，y += vY
            vY: 0,
            // 横轴加速度，vX += aX
            aX: 0,
            // 纵轴加速度，vY += aY
            aY: 0,
            // 横轴摩擦力，vX *= frictionX
            frictionX: 1,
            // 纵轴摩擦力，vY *= frictionY
            frictionY: 1,
            // 状态
            status: STATUS.NORMAL,
            // 是否允许鼠标 / touch 操作
            mouseEnable: true,
            // 对应 mousedown 和 touchstart 事件
            // 这个 func 中的 this 指向的是当前的 DisplayObject 实例
            captureFunc: util.noop,
            // 对应 mousemove 和 touchmove 事件
            // 这个 func 中的 this 指向的是当前的 DisplayObject 实例
            moveFunc: util.noop,
            // 对应 mouseup 和 touchend 事件
            // 这个 func 中的 this 指向的是当前的 DisplayObject 实例
            releaseFunc: util.noop,
            // 当前这个 DisplayObject 实例是否开启 debug 模式
            // 开始 debug 模式即绘制这个 DisplayObject 实例的时候会带上边框
            debug: false
        }, opts);

        // 子精灵
        this.children = [];

        // 当前 DisplayObject 实例的变换矩阵
        this.matrix = new Matrix();

        // 初始化的时候设置位置
        this.setPosX(this.x);
        this.setPosY(this.y);

        return this;
    }

    DisplayObject.prototype = {
        /**
         * 还原 constructor
         */
        constructor: DisplayObject,

        /**
         * 设置状态
         *
         * @param {number} status 状态值
         *                        1: 可见，每帧需要更新，各种状态都正常
         *                        2: 不可见，每帧需要更新，各种状态都正常
         *                        3: 可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
         *                        4: 不可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
         *                        5: 已经销毁（不可见），不需要更新，也不在整体的 DisplayObject 实例集合中了
         *
         * @return {Object} DisplayObject 实例
         */
        changeStatus: function (status) {
            this.status = status || this.status;
            return this;
        },

        /**
         * 设置 captureFunc，对应 mousedown 和 touchstart 事件
         * 这个 func 中的 this 指向的是当前的 DisplayObject 实例
         *
         * @param {Function} func function
         *
         * @return {Object} DisplayObject 实例
         */
        setCaptureFunc: function (func) {
            this.captureFunc = func || util.noop;
            return this;
        },

        /**
         * 设置 moveFunc，对应 mousemove 和 touchmove 事件
         * 这个 func 中的 this 指向的是当前的 DisplayObject 实例
         *
         * @param {Function} func function
         *
         * @return {Object} DisplayObject 实例
         */
        setMoveFunc: function (func) {
            this.moveFunc = func || util.noop;
            return this;
        },

        /**
         * 设置 releaseFunc，对应 mouseup 和 touchend 事件
         * 这个 func 中的 this 指向的是当前的 DisplayObject 实例
         *
         * @param {Function} func function
         *
         * @return {Object} DisplayObject 实例
         */
        setReleaseFunc: function (func) {
            this.releaseFunc = func || util.noop;
            return this;
        },

        /**
         * 设置 x 位置
         *
         * @param {number} x 横坐标
         *
         * @return {Object} DisplayObject 实例
         */
        setPosX: function (x) {
            this.x = x || 0;
            return this;
        },

        /**
         * 设置 y 位置
         *
         * @param {number} y 纵坐标
         *
         * @return {Object} DisplayObject 实例
         */
        setPosY: function (y) {
            this.y = y || 0;
            return this;
        },

        /**
         * 设置横轴加速度
         *
         * @param {number} ax 横向加速度大小
         *
         * @return {Object} DisplayObject 实例
         */
        setAccelerationX: function (ax) {
            this.aX = ax || this.aX;
            return this;
        },

        /**
         * 设置纵轴加速度
         *
         * @param {number} ay 纵向加速度大小
         *
         * @return {Object} DisplayObject 实例
         */
        setAccelerationY: function (ay) {
            this.aY = ay || this.aY;
            return this;
        },

        /**
         * 设置横轴摩擦力
         *
         * @param {number} frictionX 横轴摩擦力
         *
         * @return {Object} DisplayObject 实例
         */
        setFrictionX: function (frictionX) {
            this.frictionX = frictionX || this.frictionX;
            return this;
        },

        /**
         * 设置纵轴摩擦力
         *
         * @param {number} frictionY 横轴摩擦力
         *
         * @return {Object} DisplayObject 实例
         */
        setFrictionY: function (frictionY) {
            this.frictionY = frictionY || this.frictionY;
            return this;
        },

        /**
         * 移动
         * x, y 是指要移动的横轴、纵轴距离，而不是终点的横纵坐标
         *
         * @param {number} x 横轴要移动的距离
         * @param {number} y 纵轴要移动的距离
         *
         * @return {Object} DisplayObject 实例
         */
        move: function (x, y) {
            this.x += x;
            this.y += y;
            return this;
        },

        /**
         * 移动一步
         * 速度 += 加速度
         * 坐标 += 速度
         *
         * @return {Object} DisplayObject 实例
         */
        moveStep: function () {
            this.vX += this.aX;
            this.vX *= this.frictionX;
            this.x += this.vX;

            this.vY += this.aY;
            this.vY *= this.frictionY;
            this.y += this.vY;
            return this;
        },

        /**
         * 旋转
         * 这里注意，参数是角度，因此在 canvas 绘制的时候要转成弧度
         *
         * @param {number} angle 旋转的角度
         *
         * @return {Object} DisplayObject 实例
         */
        rotate: function (angle) {
            var offCtx = this.stageOwner.offCtx;
            offCtx.save();
            offCtx.rotate(util.deg2Rad(angle || this.angle));
            offCtx.restore();
            return this;
        },

        /**
         * 设置动画
         *
         * @param {Object} opts 动画参数
         *
         * @return {Object} 当前 DisplayObject 实例
         */
        setAnimate: function (opts) {
            var me = this;
            var animOpts = util.extend(
                true,
                {},
                {
                    fps: 60,
                    duration: 1000,
                    source: me,
                    target: {}
                },
                opts
            );
            var stepFunc = util.getType(animOpts.stepFunc) === 'function'
                ? animOpts.stepFunc
                : util.noop;

            var repeatFunc = util.getType(animOpts.repeatFunc) === 'function'
                ? animOpts.repeatFunc
                : util.noop;

            var groupCompleteFunc = util.getType(animOpts.groupCompleteFunc) === 'function'
                ? animOpts.groupCompleteFunc
                : util.noop;

            var completeFunc = util.getType(animOpts.completeFunc) === 'function'
                ? animOpts.completeFunc
                : util.noop;

            this.animate = new Animation(animOpts).play()
                .on('step', function (d) {
                    stepFunc(d);
                }).on('repeat', function (d) {
                    repeatFunc(d);
                }).on('groupComplete', function (d) {
                    groupCompleteFunc(d);
                }).on('complete', function (d) {
                    completeFunc(d);
                });

            return this;
        },

        /**
         * 停止动画
         *
         * @return {Object} 当前 Text 实例
         */
        stopAnimate: function () {
            this.animate && this.animate.stop();
            return this;
        },

        /**
         * 销毁动画
         *
         * @return {Object} 当前 Text 实例
         */
        destroyAnimate: function () {
            this.animate && this.animate.destroy();
            return this;
        },

        /**
         * 内部的每帧更新，这个方法应该是由子类重写的
         * 例如精灵表，如果调用者重写了 update 那么精灵表就不会切换帧了
         * `SubClass.superClass.update.apply(sub, arguments);` 可以在子类的实现中要调用此父类方法
         *
         * @override
         */
        _update: function () {
            return this;
        },

        /**
         * 每帧更新，这个方法应该是由子类重写的
         * `SubClass.superClass.update.apply(sub, arguments);` 可以在子类的实现中要调用此父类方法
         *
         * @override
         */
        update: function () {
            return this;
        },

        /**
         * 每帧渲染，这个方法应该是由子类重写的
         * `SubClass.superClass.render.apply(sub, arguments);` 可以在子类的实现中要调用此父类方法
         *
         * @override
         *
         * @param {Object} offCtx 离屏 canvas 2d context 对象
         */
        render: function (offCtx) {
            return this;
        },

        /**
         * 某个点是否和当前 DisplayObject 实例相交，这个方法应该是由子类重写的
         *
         * @override
         *
         * @param {number} x 点的横坐标
         * @param {number} y 点的纵坐标
         *
         * @return {boolean} 是否相交
         */
        hitTestPoint: function (x, y) {
            return false;
        },

        /**
         * 销毁
         */
        destroy: function () {
            this.status = STATUS.DESTROYED;
        }
    };

    util.inherits(DisplayObject, Event);

    return DisplayObject;
});
