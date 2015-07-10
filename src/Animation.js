/**
 * @file 动画基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var ig = require('./ig');
    var util = require('./util');
    var Event = require('./Event');
    var easing = require('./easing');

    var CONFIG = ig.getConfig();

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
            // 跳帧的个数，可以用来设置延迟
            // 如果帧数是 60fps，意味着每 1000 / 60 = 16ms 就执行一帧，
            // 如果设置为 3，那么就代表每 3 * 16 = 48ms 执行一次，帧数为 1000 / 48 = 20fps
            jumpFrames: 0
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
            this.curFrame = 0;
            this.curState = {};
            this.initState = {};

            this.frames = Math.ceil(this.duration * (CONFIG.fps || 60) / 1000);

            var source = this.source;
            var target = this.target;
            var range = this.range;

            var numericSourceVal = 0;
            var numericRangeVal = 0;
            if (range) {
                for (var j in range) {
                    if (range.hasOwnProperty(j)) {
                        numericSourceVal = parseFloat(source[j]);
                        numericRangeVal = parseFloat(range[j]);
                        this.curState[j] = {
                            from: parseFloat(numericSourceVal - numericRangeVal),
                            cur: numericSourceVal,
                            to: parseFloat(numericSourceVal + numericRangeVal)
                        };
                    }
                }
                return this;
            }

            if (util.getType(target) !== 'array') {
                for (var k in target) {
                    if (target.hasOwnProperty(k)) {
                        this.initState[k] = this.curState[k] = {
                            from: parseFloat(source[k]),
                            cur: parseFloat(source[k]),
                            to: parseFloat(target[k])
                        };
                    }
                }
                return this;
            }

            this.animIndex = 0;
            this.animLength = target.length;
            for (var m = 0; m < this.animLength; m++) {
                for (var i in target[m]) {
                    if (target[m].hasOwnProperty(i)) {
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
            // this.step();
            var me = this;
            ig.loop({
                step: function (dt, stepCount, requestID) {
                    if (me.requestID === null) {
                        return;
                    }
                    me.step.call(me, dt, stepCount, requestID);
                },
                jumpFrames: me.jumpFrames
            });
            return this;
        },

        /**
         * 停止动画
         *
         * @return {Object} Animation 实例
         */
        stop: function () {
            window.cancelAnimationFrame(this.requestID);
            this.requestID = null;
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
            this.curFrame = this.curFrame > this.frames ? this.frames : this.curFrame;
            // this.step.call(this);
            var me = this;
            ig.loop({
                step: function (dt, stepCount, requestID) {
                    if (me.requestID === null) {
                        return;
                    }
                    me.step.call(me, dt, stepCount, requestID);
                },
                jumpFrames: me.jumpFrames
            });
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
            // this.step.call(this);
            var me = this;
            ig.loop({
                step: function (dt, stepCount, requestID) {
                    if (me.requestID === null) {
                        return;
                    }
                    me.step.call(me, dt, stepCount, requestID);
                },
                jumpFrames: me.jumpFrames
            });
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
            // // this.step.call(this);
            // var me = this;
            // ig.loop({
            //     step: function (dt, stepCount, requestID) {
            //         if (me.requestID === null) {
            //             return;
            //         }
            //         me.step.call(me, dt, stepCount, requestID);
            //     },
            //     jumpFrames: me.jumpFrames
            // });
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
                for (var j in this.target) {
                    if (this.repeatCount % 2 === 0) {
                        this.curState[j] = {
                            from: this.initState[j].from,
                            cur: this.initState[j].cur,
                            to: this.initState[j].to
                        };
                    }
                    else {
                        this.curState[j] = {
                            from: this.initState[j].to,
                            cur: this.initState[j].to,
                            to: this.initState[j].from
                        };
                    }
                }
            }
            return this;
        },

        /**
         * 每一帧执行
         *
         * @param {number} dt 毫秒，固定的时间片
         * @param {number} stepCount 每帧中切分出来的每个时间片里执行的函数的计数器
         * @param {number} requestID requestAnimationFrame 标识
         */
        /* eslint-disable fecs-max-statements */
        step: function (dt, stepCount, requestID) {
            var me = this;
            me.requestID = requestID;
            me.fire('step', {
                data: {
                    source: me.source,
                    animInstance: me
                }
            });

            var ds;
            for (var i in me.curState) {
                if (me.curState.hasOwnProperty(i)) {
                    ds = me.tween(
                        me.curFrame,
                        me.curState[i].cur,
                        me.curState[i].to - me.curState[i].cur,
                        me.frames
                    ).toFixed(2);
                    me.source[i] = parseFloat(ds);
                }
            }
            me.curFrame++;

            if (me.curFrame <= me.frames) {
                return;
            }

            if (me.range && !me.rangeExec) {
                me.curFrame = 0;
                for (var j in me.curState) {
                    if (me.curState.hasOwnProperty(j)) {
                        me.curState[j] = {
                            from: me.curState[j].to,
                            cur: me.curState[j].to,
                            to: me.curState[j].from
                        };
                    }
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
                                animInstance: me,
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
                            animInstance: me
                        }
                    });
                    // 说明动画组还没有执行完
                    if (me.animIndex < me.animLength - 1) {
                        me.animIndex++;
                        me.curFrame = 0;
                        me.curState = {};
                        var flag = me.repeatCount % 2 === 0;
                        /* jshint maxdepth: 6 */
                        for (var k in me.target[me.animIndex]) {
                            if (me.target[me.animIndex].hasOwnProperty(k)) {
                                me.curState[k] = {
                                    from: flag ? me.initState[k].from : me.initState[k].to,
                                    cur: flag ? me.initState[k].cur : me.initState[k].to,
                                    to: flag ? me.initState[k].to : me.initState[k].from
                                };
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
                                    animInstance: me,
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
                                    animInstance: me
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
                                animInstance: me,
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
                                animInstance: me
                            }
                        });
                    }
                }
            }
        }
        /* eslint-enable fecs-max-statements */

    };

    util.inherits(Animation, Event);

    return Animation;
});
