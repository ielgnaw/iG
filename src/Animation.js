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
        opts = opts || {};

        // 属性全部挂载在 p 这个属性下，避免实例上挂载的属性太多，太乱
        this.p = {};

        util.extend(true, this.p, {
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

        Event.apply(this, this.p);

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

            p.paused = false;
            p.repeatCount = 0;
            p.then = Date.now();
            p.interval = 1000 / p.fps;
            p.curFrame = 0;
            p.curState = {};
            p.initState = {};
            p.frames = Math.ceil(p.duration * p.fps / 1000);

            var source = p.source;
            var target = p.target;
            var range = p.range;

            if (range) {
                for (var i in range) {
                    p.curState[i] = {
                        from: parseFloat(parseFloat(source[i]) - parseFloat(range[i])),
                        cur: parseFloat(source[i]),
                        to: parseFloat(parseFloat(source[i]) + parseFloat(range[i]))
                    };
                }
                return this;
            }

            if (util.getType(target) !== 'array') {
                for (var i in target) {
                    p.initState[i] = p.curState[i] = {
                        from: parseFloat(source[i]),
                        cur: parseFloat(source[i]),
                        to: parseFloat(target[i])
                    };
                }
                return this;
            }

            p.animIndex = 0;
            p.animLength = target.length;
            for (var m = 0; m < p.animLength; m++) {
                for (var i in target[m]) {
                    if (m === 0) {
                        p.curState[i] = {
                            from: parseFloat(source[i]),
                            cur: parseFloat(source[i]),
                            to: parseFloat(target[m][i])
                        };
                    }
                    p.initState[i] = {
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
            var p = this.p;
            if (p.requestID) {
                this.stop();
            }
            p.paused = false;
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
            this.p.paused = !this.p.paused;
            return this;
        },

        /**
         * 暂停，暂停意味着 requestAnimationFrame 还在运行，只是 Animation 停止渲染
         *
         * @return {Object} Animation 实例
         */
        pause: function () {
            this.p.paused = true;
            return this;
        },

        /**
         * 从暂停状态恢复
         *
         * @return {Object} Animation 实例
         */
        resume: function () {
            this.p.paused = false;
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
            var p = this.p;

            p.curFrame = 0;
            p.curState = {};

            if (util.getType(p.target) === 'array') {
                p.target.reverse();
                p.animIndex = 0;
                p.animLength = p.target.length;
                for (var i in p.target[p.animIndex]) {
                    if (p.repeatCount % 2 === 0) {
                        p.curState[i] = {
                            from: p.initState[i].from,
                            cur: p.initState[i].cur,
                            to: p.initState[i].to
                        };
                    }
                    else {
                        p.curState[i] = {
                            from: p.initState[i].to,
                            cur: p.initState[i].to,
                            to: p.initState[i].from
                        };
                    }
                }
            }
            else {
                for (var i in p.target) {
                    if (p.repeatCount % 2 === 0) {
                        p.curState[i] = {
                            from: p.initState[i].from,
                            cur: p.initState[i].cur,
                            to: p.initState[i].to
                        };
                    }
                    else {
                        p.curState[i] = {
                            from: p.initState[i].to,
                            cur: p.initState[i].to,
                            to: p.initState[i].from
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
            var p = me.p;

            p.requestID = window.requestAnimationFrame(
                (function (context) {
                    return function () {
                        me.step.call(me);
                    };
                })(me)
            );

            if (p.paused) {
                return;
            }

            p.now = Date.now();
            p.delta = p.now - p.then;

            if (p.delta <= p.interval) {
                return;
            }

            me.fire('step', {
                data: {
                    source: p.source,
                    instance: me
                }
            });
            p.then = p.now - (p.delta % p.interval);
            var ds;
            for (var i in p.curState) {
                ds = p.tween(
                    p.curFrame,
                    // p.curState[i].from,
                    // p.curState[i].to - p.curState[i].from,
                    p.curState[i].cur,
                    p.curState[i].to - p.curState[i].cur,
                    p.frames
                ).toFixed(2);
                p.source[i] = parseFloat(ds);
            }
            p.curFrame++;

            if (p.curFrame < p.frames) {
                return;
            }

            if (p.range && !p.rangeExec) {
                p.curFrame = 0;
                for (var i in p.curState) {
                    p.curState[i] = {
                        from: p.curState[i].to,
                        cur: p.curState[i].to,
                        to: p.curState[i].from
                    };
                }
                if (!p.repeat) {
                    p.rangeExec = true;
                }
                else {
                    p.repeatCount++;
                    if (p.repeatCount % 2 === 0) {
                        me.fire('repeat', {
                            data: {
                                source: p.source,
                                instance: me,
                                repeatCount: p.repeatCount / 2
                            }
                        });
                    }
                }
            }
            else {
                // 说明 target 是数组
                if (p.animLength) {
                    me.fire('groupComplete', {
                        data: {
                            source: p.source,
                            instance: me
                        }
                    });
                    // 说明动画组还没有执行完
                    if (p.animIndex < p.animLength - 1) {
                        p.animIndex++;
                        p.curFrame = 0;
                        p.curState = {};
                        var flag = p.repeatCount % 2 === 0;
                        for (var i in p.target[p.animIndex]) {
                            p.curState[i] = {
                                from: flag ? p.initState[i].from : p.initState[i].to,
                                cur: flag ? p.initState[i].cur : p.initState[i].to,
                                to: flag ? p.initState[i].to : p.initState[i].from,
                            };
                        }
                    }
                    else {
                        // debugger
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
                            me.stop();
                            p.paused = false;
                            me.fire('complete', {
                                data: {
                                    source: p.source,
                                    instance: me
                                }
                            });
                        }
                    }
                }
                else {
                    // debugger
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
                        me.stop();
                        p.paused = false;
                        me.fire('complete', {
                            data: {
                                source: p.source,
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
