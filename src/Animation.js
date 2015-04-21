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
    var GUID_KEY = 0;

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
        util.extend(true, this, {
            // 名称
            name: GUID_KEY++,
            // 源对象，动画的结果最终体现在这个对象的某些属性上
            source: {},
            // 目标属性，里面设置的属性就是 source 对象的属性变化的最终值，
            // 如果这个值是数组，那么意味着是动画组，会按数组的正常顺序一个一个去执行，
            // 如果存在 repeat，那么会把数组里面的整体完成后再 repeat
            target: null,
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
            this.paused = false;
            this.repeatCount = 0;
            this.then = Date.now();
            this.interval = 1000 / this.fps;
            this.curFrame = 0;
            this.curState = {};
            this.initState = {};
            this.frames = Math.ceil(this.duration * this.fps / 1000);

            var source = this.source;
            var target = this.target;
            var range = this.range;

            if (range) {
                for (var i in range) {
                    this.curState[i] = {
                        from: parseFloat(parseFloat(source[i]) - parseFloat(range[i])),
                        cur: parseFloat(source[i]),
                        to: parseFloat(parseFloat(source[i]) + parseFloat(range[i]))
                    };
                }
                return this;
            }

            if (util.getType(target) !== 'array') {
                for (var i in target) {
                    this.initState[i] = this.curState[i] = {
                        from: parseFloat(source[i]),
                        cur: parseFloat(source[i]),
                        to: parseFloat(target[i])
                    };
                }
                return this;
            }

            this.animIndex = 0;
            this.animLength = target.length;
            for (var m = 0; m < this.animLength; m++) {
                for (var i in target[m]) {
                    if (m === 0) {
                        this.curState[i] = {
                            from: parseFloat(source[i]),
                            cur: parseFloat(source[i]),
                            to: parseFloat(target[m][i])
                        };
                    }
                    this.initState[i] = {
                        from: parseFloat(source[i]),
                        cur: parseFloat(source[i]),
                        to: parseFloat(target[m][i])
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
            if (this.requestID) {
                this.stop();
            }
            this.paused = false;
            this.step();
            return this;
        },

        /**
         * 停止动画
         *
         * @return {Object} Animation 实例
         */
        stop: function () {
            window.cancelAnimationFrame(this.requestID);
            return this;
        },

        /**
         * 销毁
         */
        destroy: function () {
            this.stop();
            this.clearEvents();
        },

        /**
         * 切换暂停状态
         *
         * @return {Object} Animation 实例
         */
        togglePause: function () {
            this.paused = !this.paused;
            return this;
        },

        /**
         * 暂停，暂停意味着 requestAnimationFrame 还在运行，只是 Animation 停止渲染
         *
         * @return {Object} Animation 实例
         */
        pause: function () {
            this.paused = true;
            return this;
        },

        /**
         * 从暂停状态恢复
         *
         * @return {Object} Animation 实例
         */
        resume: function () {
            this.paused = false;
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
         * 转换 from 和 to，即动画的起点和终点
         * 主要是为 repeat 和 range 的时候使用
         *
         * @return {Object} Animation 实例
         */
        swapFromTo: function () {
            this.curFrame = 0;
            this.curState = {};

            if (util.getType(this.target) === 'array') {
                this.target.reverse();
                this.animIndex = 0;
                this.animLength = this.target.length;
                for (var i in this.target[this.animIndex]) {
                    if (this.repeatCount % 2 === 0) {
                        this.curState[i] = {
                            from: this.initState[i].from,
                            cur: this.initState[i].cur,
                            to: this.initState[i].to
                        };
                    }
                    else {
                        this.curState[i] = {
                            from: this.initState[i].to,
                            cur: this.initState[i].to,
                            to: this.initState[i].from
                        };
                    }
                }
            }
            else {
                for (var i in this.target) {
                    if (this.repeatCount % 2 === 0) {
                        this.curState[i] = {
                            from: this.initState[i].from,
                            cur: this.initState[i].cur,
                            to: this.initState[i].to
                        };
                    }
                    else {
                        this.curState[i] = {
                            from: this.initState[i].to,
                            cur: this.initState[i].to,
                            to: this.initState[i].from
                        };
                    }
                }
            }
            return this;
        },

        /**
         * 每一帧执行
         */
        step: function () {
            var me = this;

            me.requestID = window.requestAnimationFrame(
                (function (context) {
                    return function () {
                        me.step.call(me);
                    };
                })(me)
            );

            if (me.paused) {
                return;
            }

            me.now = Date.now();
            me.delta = me.now - me.then;

            if (me.delta <= me.interval) {
                return;
            }

            me.fire('step', {
                data: {
                    source: me.source,
                    instance: me
                }
            });
            me.then = me.now - (me.delta % me.interval);
            var ds;
            for (var i in me.curState) {
                ds = me.tween(
                    me.curFrame,
                    // me.curState[i].from,
                    // me.curState[i].to - me.curState[i].from,
                    me.curState[i].cur,
                    me.curState[i].to - me.curState[i].cur,
                    me.frames
                ).toFixed(2);
                me.source[i] = parseFloat(ds);
                // console.warn(me.source[i]);
            }
            me.curFrame++;

            if (me.curFrame < me.frames) {
                return;
            }

            if (me.range && !me.rangeExec) {
                me.curFrame = 0;
                for (var i in me.curState) {
                    me.curState[i] = {
                        from: me.curState[i].to,
                        cur: me.curState[i].to,
                        to: me.curState[i].from
                    };
                }
                if (!me.repeat) {
                    me.rangeExec = true;
                }
                else {
                    me.repeatCount++;
                    if (me.repeatCount % 2 === 0) {
                        me.fire('repeat', {
                            data: {
                                source: me.source,
                                instance: me,
                                repeatCount: me.repeatCount / 2
                            }
                        });
                    }
                }
            }
            else {
                // 说明 target 是数组
                if (me.animLength) {
                    me.fire('groupComplete', {
                        data: {
                            source: me.source,
                            instance: me
                        }
                    });
                    // 说明动画组还没有执行完
                    if (me.animIndex < me.animLength - 1) {
                        me.animIndex++;
                        me.curFrame = 0;
                        me.curState = {};
                        var flag = me.repeatCount % 2 === 0;
                        for (var i in me.target[me.animIndex]) {
                            me.curState[i] = {
                                from: flag ? me.initState[i].from : me.initState[i].to,
                                cur: flag ? me.initState[i].cur : me.initState[i].to,
                                to: flag ? me.initState[i].to : me.initState[i].from,
                            };
                        }
                    }
                    else {
                        // debugger
                        if (me.repeat) {
                            me.repeatCount++;
                            me.swapFromTo();
                            me.fire('repeat', {
                                data: {
                                    source: me.source,
                                    instance: me,
                                    repeatCount: me.repeatCount
                                }
                            });
                        }
                        else {
                            me.stop();
                            me.paused = false;
                            me.fire('complete', {
                                data: {
                                    source: me.source,
                                    instance: me
                                }
                            });
                        }
                    }
                }
                else {
                    // debugger
                    if (me.repeat) {
                        me.repeatCount++;
                        me.swapFromTo();
                        me.fire('repeat', {
                            data: {
                                source: me.source,
                                instance: me,
                                repeatCount: me.repeatCount
                            }
                        });
                    }
                    else {
                        me.stop();
                        me.paused = false;
                        me.fire('complete', {
                            data: {
                                source: me.source,
                                instance: me
                            }
                        });
                    }
                }
            }
        }

    };

    util.inherits(Animation, Event);

    return Animation;
});
