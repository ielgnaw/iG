/**
 * @file 动画
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var util = require('./util');
    var Event = require('./Event');
    var easing = require('./easing');

    var _defaultFPS = 60;

    /**
     * 动画基类
     *
     * @constructor
     *
     * @param {Object} opts 参数
     */
    function Animation(opts) {
        opts = opts || {};
        Event.apply(this, arguments);

        this.p = util.extend({
            // 源对象，动画的结果最终体现在这个对象的某些属性上
            source: {},

            // 目标属性，里面设置的属性就是 source 对象的属性变化的最终值
            target: {},

            // 范围运动，这个对象里面设置的属性也是对应的 source 对象属性，
            // 与 target 不同的是，这里会把 range 里面设置的值当做运动的范围， +- 运动
            // 例如设置了 range: {x: 5}， 那么运动的范围就是 source.x - 5 至 source.x + 5 之间
            range: null,

            // 动画缓动类型
            tween: easing.linear,

            // 是否重复
            repeat: false,

            // 间隔时间，根据这个时间和 fps 计算帧数
            duration: 1000,

            // fps
            fps: _defaultFPS
        }, opts);

        this.setup();

        // 记录 repeat 的次数
        this.repeatCount = 0;

        this._then = Date.now();
        this._now;
        this._delta;
        this._interval = 1000 / this.p.fps;
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
            this.running = false;
            this.curFrame = 0;
            this.initState = {};
            this.frames = Math.ceil(this.p.duration * this.p.fps / 1000);

            var source = this.p.source;
            var target = this.p.target;
            var range = this.p.range;
            if (range) {
                for (var i in range) {
                    this.initState[i] = {
                        from: parseFloat(source[i] - range[i]),
                        to: parseFloat(source[i] + range[i])
                    };
                }
            }
            else {
                for (var i in target) {
                    this.initState[i] = {
                        from: parseFloat(source[i]),
                        to: parseFloat(target[i])
                    };
                }
            }

            return this;
        },

        /**
         * 转换 from 和 to，即动画的起点和终点
         *
         * @return {Object} Animation 实例
         */
        swapFromTo: function () {
            var newInitState = {};
            for (var i in this.initState) {
                newInitState[i] = {
                    from: this.initState[i].to,
                    to: this.initState[i].from
                };
            }

            this.curFrame = 0;
            this.initState = newInitState;
            return this;
        },

        /**
         * 重复
         *
         * @return {Object} Animation 实例
         */
        repeat: function () {
            this.repeatCount++;
            this.swapFromTo();
            this.fire('repeat', {
                data: {
                    source: this.p.source,
                    instance: this,
                    repeatCount: this.repeatCount
                }
            });
            this.play();
            return this;
        },

        /**
         * 开始播放
         *
         * @return {Object} Animation 实例
         */
        play: function () {
            this.running = true;
            if (this.timer) {
                this.stop();
            }
            this.step();
            return this;
        },

        /**
         * 停止动画
         *
         * @return {Object} Animation 实例
         */
        stop: function () {
            window.cancelAnimationFrame(this.timer);
            return this;
        },

        /**
         * 向后一帧
         *
         * @return {Object} Animation 实例
         */
        next: function () {
            this.stop();
            this.curFrame++;
            this.curFrame = this.curFrame > this.frames ? this.frames: this.curFrame;
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
            this.curFrame--;
            this.curFrame = this.curFrame < 0 ? 0 : this.curFrame;
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
            this.curFrame = frame;
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
            this.curFrame = frame;
            this.step.call(this);
            return this;
        },

        /**
         * 每一帧执行
         */
        step: function () {
            var me = this;
            me.timer = window.requestAnimationFrame(
                (function (context) {
                    return function () {
                        me.step.call(me);
                    };
                })(me)
            );
            me._now = Date.now();
            me._delta = me._now - me._then;
            if (me._delta > me._interval) {
                me._then = me._now - (me._delta % me._interval);
                var ds;
                for (var i in me.initState) {
                    ds = me.p.tween(
                        me.curFrame,
                        me.initState[i].from,
                        me.initState[i].to - me.initState[i].from,
                        me.frames
                    ).toFixed(2);
                    me.p.source[i] = parseFloat(ds);
                }
                me.curFrame++;
                if (this.curFrame >= this.frames) {
                    if (me.p.repeat) {
                        me.repeat.call(me);
                    }
                    else {
                        if (me.p.range && !me.p.rangeExec) {
                            me.p.rangeExec = true;
                            me.swapFromTo();
                        }
                        else {
                            me.stop();
                            me.running = false;
                            me.fire('complete', {
                                data: {
                                    source: me.p.source,
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
