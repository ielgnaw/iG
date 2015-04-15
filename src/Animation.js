/**
 * @file 动画基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var util = require('./util');
    var Event = require('./Event');
    var easing = require('./easing');

    /**
     * 默认的 fps
     *
     * @type {number}
     */
    var DEFAULT_FPS = 60;

    /**
     * 名字标示
     *
     * @type {number}
     */
    var NAME_GUID = 0;

    /**
     * 动画基类
     *
     * @constructor
     *
     * @param {Object} opts 参数
     *
     * @return {Object} Animation 实例
     */
    function Animation(opts) {
        Event.apply(this, arguments);

        opts = opts || {};

        // 属性全部挂载在 p 这个属性下，避免实例上挂载的属性太多，太乱
        this.p = {};

        util.extend(true, this.p, {

            name: NAME_GUID++,

            // 源对象，动画的结果最终体现在这个对象的某些属性上
            source: {},

            // 目标属性，里面设置的属性就是 source 对象的属性变化的最终值
            target: {},

            // 范围运动，这个对象里面设置的属性也是对应的 source 对象属性，
            // 与 target 不同的是，这里会把 range 里面设置的值当做运动的范围， +- 运动
            // 例如设置了 range: {x: 5}， 那么运动的范围就是 source.x - 5 至 source.x + 5 之间
            // 设置此属性后，target 的设置就无效了
            range: null,

            // 动画缓动类型
            tween: easing.linear,

            // 是否重复
            repeat: false,

            // 间隔时间，根据这个时间和 fps 计算帧数
            duration: 1000,

            // fps
            fps: DEFAULT_FPS
        }, opts);

        this.setup();

        return this;
    }

    Animation.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Animation,

        /**
         * 初始化
         *
         * @return {Object} Animation 实例
         */
        setup: function () {
            var p = this.p;

            p.running = false;
            p.repeatCount = 0;
            p.then = Date.now();
            p.interval = 1000 / p.fps;
            p.curFrame = 0;
            p.initState = {};
            p.frames = Math.ceil(p.duration * p.fps / 1000);

            var source = p.source;
            var target = p.target;
            var range = p.range;
            if (range) {
                for (var i in range) {
                    p.initState[i] = {
                        from: parseFloat(parseFloat(source[i]) - parseFloat(range[i])),
                        cur: parseFloat(source[i]),
                        to: parseFloat(parseFloat(source[i]) + parseFloat(range[i]))
                    };
                }
            }
            else {
                for (var i in target) {
                    p.initState[i] = {
                        from: parseFloat(source[i]),
                        cur: parseFloat(source[i]),
                        to: parseFloat(target[i])
                    };
                }
            }

            return this;
        },

        /**
         * 开始播放
         *
         * @return {Object} Animation 实例
         */
        play: function () {
            var p = this.p;
            if (p.requestID) {
                this.stop();
            }
            p.running = true;
            this.step();
            return this;
        },

        /**
         * 停止动画
         *
         * @return {Object} Animation 实例
         */
        stop: function () {
            window.cancelAnimationFrame(this.p.requestID);
            return this;
        },

        /**
         * 向后一帧
         *
         * @return {Object} Animation 实例
         */
        next: function () {
            this.stop();
            var p = this.p;
            p.curFrame++;
            p.curFrame = p.curFrame > p.frames ? p.frames: p.curFrame;
            this.step.call(this);
            return this;
        },

        /**
         * 向前一帧
         *
         * @return {Object} Animation 实例
         */
        prev: function () {
            this.stop();
            var p = this.p;
            p.curFrame--;
            p.curFrame = p.curFrame < 0 ? 0 : p.curFrame;
            this.step.call(this);
            return this;
        },

        /**
         * 跳跃到指定帧并播放
         *
         * @param {number} frame 要跳到的帧数
         *
         * @return {Object} Animation 实例
         */
        gotoAndPlay: function (frame) {
            this.stop();
            this.p.curFrame = frame;
            this.play.call(this);
            return this;
        },

        /**
         * 跳到指定帧停止播放
         *
         * @param {number} frame 要跳到的帧数
         *
         * @return {Object} Animation 实例
         */
        gotoAndStop: function (frame) {
            this.stop();
            this.p.curFrame = frame;
            this.step.call(this);
            return this;
        },

        /**
         * 转换 from 和 to，即动画的起点和终点
         * 主要是为 repeat 和 range 的时候使用
         *
         * @return {Object} Animation 实例
         */
        swapFromTo: function () {
            var newInitState = {};
            var p = this.p;
            for (var i in p.initState) {
                newInitState[i] = {
                    from: p.initState[i].to,
                    cur: p.initState[i].to,
                    to: p.initState[i].from
                };
            }

            p.curFrame = 0;
            p.initState = newInitState;
            return this;
        },

        /**
         * 每一帧执行
         */
        step: function () {
            var me = this;
            var p = me.p;
            p.requestID = window.requestAnimationFrame(
                (function (context) {
                    return function () {
                        me.step.call(me);
                    };
                })(me)
            );
            p.now = Date.now();
            p.delta = p.now - p.then;
            if (p.delta > p.interval) {
                me.fire('step', {
                    data: {
                        source: p.source,
                        instance: me
                    }
                });
                p.then = p.now - (p.delta % p.interval);
                var ds;
                for (var i in p.initState) {
                    ds = p.tween(
                        p.curFrame,
                        // p.initState[i].from,
                        // p.initState[i].to - p.initState[i].from,
                        p.initState[i].cur,
                        p.initState[i].to - p.initState[i].cur,
                        p.frames
                    ).toFixed(2);
                    p.source[i] = parseFloat(ds);
                }
                p.curFrame++;
                if (p.curFrame >= p.frames) {
                    if (p.repeat) {
                        p.repeatCount++;
                        me.swapFromTo();
                        me.fire('repeat', {
                            data: {
                                source: p.source,
                                instance: me,
                                repeatCount: p.repeatCount
                            }
                        });
                    }
                    else {
                        if (p.range && !p.rangeExec) {
                            p.rangeExec = true;
                            me.swapFromTo();
                        }
                        else {
                            me.stop();
                            p.running = false;
                            me.fire('complete', {
                                data: {
                                    source: p.source,
                                    instance: me
                                }
                            });
                        }
                    }
                    return;
                }
            }
        }

    };

    util.inherits(Animation, Event);

    return Animation;
});
