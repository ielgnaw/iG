/**
 * @file DisplayObject 基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var ig = require('./ig');
    var Event = require('./Event');
    var util = require('./util');
    var Animation = require('./Animation');
    var Matrix = require('./Matrix');

    var CONFIG = ig.getConfig();
    var STATUS = CONFIG.status;

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
     * @param {number} opts.cx 中心点横坐标，默认 0
     * @param {number} opts.cy 中心点纵坐标 0
     * @param {number} opts.radius 半径，默认 0，矩形也可以有半径，这时半径是为了当前矩形做圆周运动的辅助
     * @param {number} opts.scaleX 横轴缩放倍数，默认 1
     * @param {number} opts.scaleY 纵轴缩放倍数，默认 1
     * @param {number} opts.angle 旋转角度，这里使用的是角度，canvas 使用的是弧度，默认 1
     * @param {number} opts.alpha 透明度，默认 1
     * @param {number} opts.zIndex 层叠关系，类似 css z-index 概念，默认 0
     * @param {string} opts.fillStyle fill 的样式，如果没有，就用 ctx 的默认的
     * @param {string} opts.strokeStyle stroke 的样式，如果没有，就用 ctx 的默认的
     * @param {Image} opts.image image 图像，这个参数是一个 image 对象
     * @param {number} opts.vx 横轴速度，默认 0
     * @param {number} opts.vy 纵轴速度，默认 0
     * @param {number} opts.ax 横轴加速度，默认 0
     * @param {number} opts.ay 纵轴加速度，默认 0
     * @param {number} opts.frictionX 横轴摩擦力，默认 1
     * @param {number} opts.frictionY 纵轴摩擦力，默认 1
     * @param {Array} opts.children 子精灵
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
            cx: 0,
            // 中心点纵坐标
            cy: 0,
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
            // 横轴速度，x += vx * dt
            vx: 0,
            // 纵轴速度，y += vy * dt
            vy: 0,
            // 横轴加速度，vx += ax * dt
            ax: 0,
            // 纵轴加速度，vy += ay * dt
            ay: 0,
            // 横轴摩擦力，vx *= frictionX * dt
            frictionX: 1,
            // 纵轴摩擦力，vy *= frictionY * dt
            frictionY: 1,
            // 子精灵
            children: [],
            // 当前 displayObject 作为子精灵的模式，只在作为子精灵时生效
            // 1 跟随父精灵，即变换以及运动都是跟随父精灵，由父精灵控制，设置子精灵的变换以及运动是无效的
            // 0 不跟随父精灵，父精灵的变换以及运动不会影响子精灵，可以单独设置子精灵的变换以及运动
            // 默认为 1，跟随父精灵
            followParent: 1,
            // 父精灵
            parent: null,
            // 状态
            status: STATUS.NORMAL,
            // 是否允许鼠标 / touch 操作
            mouseEnable: false,
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

        // 私有属性
        this._ = {};

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
         * 设置 DisplayObject 实例的 matrix
         *
         * @param {Array} m matrix 数组
         *
         * @return {Object} DisplayObject 实例
         */
        setMatrix: function (m) {
            this.matrix.m = m;
            return this;
        },

        /**
         * 设置 DisplayObject 实例的 relativeX, relativeY，只有子精灵才会有
         *
         * @param {number} x 横坐标
         * @param {number} y 纵坐标
         *
         * @return {Object} DisplayObject 实例
         */
        setRelativeXY: function (x, y) {
            this.relativeX = x;
            this.relativeY = y;
            return this;
        },

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
        setStatus: function (status) {
            this.status = status || this.status;
            var children = this.children;
            for (var i = 0, len = children.length; i < len; i++) {
                children[i].status = this.status;
            }
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
            this.x = x || this.x;
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
            this.y = y || this.y;
            return this;
        },

        /**
         * 设置位置，即设置 x, y
         *
         * @param {number} x 横坐标
         * @param {number} y 纵坐标
         *
         * @return {Object} DisplayObject 实例
         */
        setPos: function (x, y) {
            this.x = x || this.x;
            this.y = y || this.y;
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
            this.ax = ax || this.ax;
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
            this.ay = ay || this.ay;
            return this;
        },

        /**
         * 设置横轴和纵轴加速度
         *
         * @param {number} ax 横向加速度大小
         * @param {number} ay 纵向加速度大小
         *
         * @return {Object} DisplayObject 实例
         */
        setAcceleration: function (ax, ay) {
            this.ax = ax || this.ax;
            this.ay = ay || this.ay;
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
         * 设置横轴纵轴摩擦力
         *
         * @param {number} frictionX 横轴摩擦力
         * @param {number} frictionY 横轴摩擦力
         *
         * @return {Object} DisplayObject 实例
         */
        setFriction: function (frictionX, frictionY) {
            this.frictionX = frictionX || this.frictionX;
            this.frictionY = frictionY || this.frictionY;
            return this;
        },

        /**
         * 设置横轴缩放倍数
         *
         * @param {number} scaleX 横轴缩放倍数
         *
         * @return {Object} DisplayObject 实例
         */
        setScaleX: function (scaleX) {
            this.scaleX = scaleX || this.scaleX;
            return this;
        },

        /**
         * 设置纵轴缩放倍数
         *
         * @param {number} scaleY 纵轴缩放倍数
         *
         * @return {Object} DisplayObject 实例
         */
        setScaleY: function (scaleY) {
            this.scaleY = scaleY || this.scaleY;
            return this;
        },

        /**
         * 设置横轴和纵轴缩放倍数
         *
         * * @param {number} scaleX 横轴缩放倍数
         * @param {number} scaleY 纵轴缩放倍数
         *
         * @return {Object} DisplayObject 实例
         */
        setScale: function (scaleX, scaleY) {
            this.scaleX = scaleX || this.scaleX;
            this.scaleY = scaleY || this.scaleY;
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
            // var offCtx = this.stage.offCtx;
            // offCtx.save();
            // offCtx.rotate(util.deg2Rad(angle || this.angle || 0));
            // offCtx.restore();
            var ctx = this.stage.ctx;
            ctx.save();
            ctx.rotate(util.deg2Rad(angle || this.angle || 0));
            ctx.restore();
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
                    source: me
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

            var childLen = 0;
            if (Array.isArray(this.children) && (childLen = this.children.length)) {
                var childAnimOpts = {};
                if (!this._.isHandleChildren) {
                    var children = this.children;
                    this._.isHandleChildren = true;

                    // 实例化 children 的时候，children 的 x, y 是相对于 parent 的 x, y 的
                    for (var i = 0; i < childLen; i++) {
                        var child = children[i];
                        child.setRelativeXY(child.x, child.y);
                        child.x += this.x;
                        child.y += this.y;
                        child.move(child.x, child.y);
                        child.parent = this;
                        child.setMatrix(this.matrix.m);
                    }
                }

                for (var i = 0; i < childLen; i++) {
                    if (this.children[i].followParent) {
                        childAnimOpts = util.extend(true, {}, {source: this.children[i]}, opts);
                        // 子精灵的 x, y 是相对于父精灵的 x, y 来定位的
                        if (opts.target.x) {
                            childAnimOpts.target.x += this.children[i].x + this.x;
                        }
                        if (opts.target.y) {
                            childAnimOpts.target.y += this.children[i].y - this.y;
                        }
                        this.children[i].animate = new Animation(childAnimOpts).play();
                    }
                }
            }

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
         * 销毁
         */
        destroy: function () {
            this.status = STATUS.DESTROYED;
        },

        /**
         * 移动
         * x, y 是指要移动到的横轴、纵轴目标位置即终点坐标
         *
         * @param {number} x 终点横坐标
         * @param {number} y 终点纵坐标
         *
         * @return {Object} DisplayObject 实例
         */
        move: function (x, y) {
            this.x = x || this.x;
            this.y = y || this.y;
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
         * 内部的每帧更新，这个方法应该是由引擎内部的子类重写的，不应由开发者自定义的类重写
         * 例如精灵表，如果调用者重写了 step 那么精灵表就不会切换帧了
         * `SubClass.superClass.step.apply(sub, arguments);` 可以在子类的实现中要调用此父类方法
         *
         * @override
         *
         * @param {number} dt 毫秒，固定的时间片
         * @param {number} stepCount 每帧中切分出来的每个时间片里执行的函数的计数器
         * @param {number} requestID requestAnimationFrame 标识
         */
        _step: function (dt, stepCount, requestID) {
            return this;
        },

        /**
         * 每帧更新，这个方法应该是由子类重写的
         * `SubClass.superClass.update.apply(sub, arguments);` 可以在子类的实现中要调用此父类方法
         *
         * @override
         *
         * @param {number} dt 毫秒，固定的时间片
         * @param {number} stepCount 每帧中切分出来的每个时间片里执行的函数的计数器
         * @param {number} requestID requestAnimationFrame 标识
         */
        step: function (dt, stepCount, requestID) {
            return this;
        },

        /**
         * 每帧渲染，这个方法应该是由子类重写的
         * `SubClass.superClass.render.apply(sub, arguments);` 可以在子类的实现中要调用此父类方法
         *
         * @override
         *
         * @param {Object} ctx canvas 2d context 对象
         */
        render: function (ctx) {
            return this;
        }

        /**
         * 移动一步
         * 速度 += 加速度
         * 坐标 += 速度
         *
         * @return {Object} DisplayObject 实例
         */
        // moveStep: function () {
        //     this.vx += this.ax;
        //     this.vx *= this.frictionX;
        //     this.x += this.vx;

        //     this.vy += this.ay;
        //     this.vy *= this.frictionY;
        //     this.y += this.vy;
        //     return this;
        // },
    };

    util.inherits(DisplayObject, Event);

    return DisplayObject;
});
