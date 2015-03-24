/**
 * @file Game 类
 * 游戏的主启动在这里，渲染过程：
 * Game: render --> Stage: render --> DisplayObject: render
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var Event = require('./Event');
    var util = require('./util');
    var Stage = require('./Stage');

    var guid = 0;

    var defaultFPS = 60;
    var now;
    var startTime;
    var interval;
    var delta; // 时间差即每帧的时间间隔

    var realFpsStart;
    var realFps;
    var realDelta;

    /**
     * Game 类，一个游戏应该对这个游戏中的场景进行管理
     *
     * @constructor
     */
    function Game(opts) {
        opts = opts || {};

        Event.apply(this, arguments);

        this.name = (opts.name === null || opts.name === void 0) ? 'ig_game_' + (guid++) : opts.name;

        // 暂停
        this.paused = false;

        // 当前游戏实例中的所有场景，堆栈，后进先出
        this.stageStack = [];

        // 当前游戏实例中的所有场景，对象，方便读取
        this.stages = {};

        defaultFPS = opts.fps || 60;
    }

    Game.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Game,

        /**
         * 游戏开始
         *
         * @param {Function} startCallback 游戏开始的回调函数
         *
         * @return {Object} Game 实例
         */
        start: function (startCallback) {
            var me = this;
            me.paused = false;

            startTime = Date.now();
            now = 0;
            interval = 1000 / defaultFPS;
            delta = 0;

            realFpsStart = Date.now();
            realFps = 0;
            realDelta = 0;

            me.requestID = window.requestAnimationFrame(function () {
                me.render.call(me);
            });

            util.getType(startCallback) === 'function' && startCallback.call(me, {
                data: {
                    startTime: startTime,
                    interval: interval
                }
            });

            return me;
        },

        /**
         * Game 的 render，在这里，需要做的事情是触发各个事件，以及渲染场景
         * 而精灵的渲染是通过场景的渲染来渲染的，精灵的渲染和 Game 的渲染是没有关系的
         */
        render: function () {
            var me = this;

            me.requestID = window.requestAnimationFrame(
                (function (context) {
                    return function () {
                        context.render.call(context);
                    };
                })(me)
            );

            if (!me.paused) {

                now = Date.now();
                delta = now - startTime; // 时间差即每帧的时间间隔

                if (delta > interval) {
                    // 仅仅 `startTime = now` 的判断是不够的，
                    // 例如设置 fps = 10，意味着每帧必须是 100ms，而现在帧执行时间是 16ms (60 fps)
                    // 所以需要循环 7 次 (16 * 7 = 112ms) 才能满足 `delta > interval === true`。
                    // 这会导致降低了FPS， 112 * 10 = 1120ms (不是 1000ms)
                    // 因此这里 `delta % interval`
                    startTime = now - (delta % interval);

                    me.fire('beforeGameRender', {
                        data: {
                            startTime: startTime
                        }
                    });

                    var curStage = me.getCurrentStage();

                    if (curStage) {
                        curStage.update();
                        curStage.render();
                    }

                    me.fire('afterGameRender', {
                        data: {
                            startTime: startTime
                        }
                    });
                }

                if (realDelta > 1000) {
                    realFpsStart = Date.now();
                    realDelta = 0;
                    me.fire('gameFPS', {
                        data: {
                            fps: realFps
                        }
                    });

                    realFps = 0;
                }
                else {
                    realDelta = Date.now() - realFpsStart;
                    ++realFps;
                }
            }
        },

        /**
         * 游戏暂停，暂停意味着 requestAnimationFrame 还在运行，只是游戏停止渲染
         *
         * @return {Object} Game 实例
         */
        pause: function () {
            this.paused = true;
            return this;
        },

        /**
         * 从暂停状态恢复
         * @return {Object} Game 实例
         */
        resume: function () {
            this.paused = false;
            return this;
        },

        /**
         * 停止游戏
         * @return {Object} Game 实例
         */
        stop: function () {
            window.cancelAnimationFrame(this.requestID);
            return this;
        },

        /**
         * 获取当前游戏里面的所有场景
         *
         * @return {Array} 所有场景集合
         */
        getStageStack: function () {
            return this.stageStack;
        },

        /**
         * 根据场景名字获取场景对象
         *
         * @param {string} name 场景名字
         *
         * @return {Object} 场景对象
         */
        getStageByName: function (name) {
            return this.stages[name];
        },

        /**
         * 创建一个场景
         *
         * @param {Object} stageOpts 创建场景所需的参数
         *
         * @return {Object} 创建的场景对象
         */
        createStage: function (stageOpts) {
            var stage = new Stage(stageOpts);
            this.pushStage(stage);
            return stage;
        },

        /**
         * 添加场景，场景入栈
         *
         * @param {Object} stage 场景对象
         */
        pushStage: function (stage) {
            var me = this;
            if (!me.getStageByName(stage.name)) {
                stage.gameOwner = me;
                me.stageStack.push(stage);
                me.stages[stage.name] = stage;
                me.sortStageIndex();
            }
        },

        /**
         * 场景出栈
         */
        popStage: function () {
            var me = this;
            var stage = me.stageStack.pop();
            if (stage) {
                stage.clean();
                delete me.stages[stage.name];
                me.sortStageIndex();
            }
        },

        /**
         * 场景排序
         */
        sortStageIndex: function () {
            var stageStack = this.stageStack;
            for (var i = 0, len = stageStack.length; i < len; i++) {
                stageStack[i].container.style.zIndex = i;
            }
        },

        /**
         * 根据名字移除一个场景，它和 popStage 的区别是
         * popStage 只会清除栈顶的那一个
         *
         * @param {string} name 场景名字
         */
        removeStageByName: function (name) {
            var me = this;
            var st = me.getStageByName(name);
            if (st) {
                st.clean();
                delete me.stages[st.name];
                var stageStack = me.stageStack;
                util.removeArrByCondition(stageStack, function (s) {
                    return s.name === name;
                });
                me.sortStageIndex();
            }
        },

        /**
         * 交换场景位置
         *
         * @param {number} from 起始位置
         * @param {number} to 目标位置
         */
        swapStage: function (from, to) {
            var me = this;
            var stageStack = me.stageStack;
            var len = stageStack.length;
            if (from >= 0 && from <= len - 1
                    && to >= 0 && to <= len - 1
            ) {
                var sc = stageStack[from];
                stageStack[from] = stageStack[to];
                stageStack[to] = sc;
                me.sortStageIndex();
            }
        },

        /**
         * 获取场景的 zIndex，场景的排序实际上就是变化 zIndex
         *
         * @param {Object} stage 场景对象
         *
         * @return {number} zIndex
         */
        getStageIndex: function (stage) {
            return stage.container.style.zIndex;
        },

        /**
         * 获取当前场景，栈的第一个为当前场景
         *
         * @return {Object} 场景对象
         */
        getCurrentStage: function () {
            var me = this;
            return me.stageStack[me.stageStack.length - 1];
        },

        /**
         * 清除所有场景
         */
        clearAllStage: function () {
            var me = this;
            for (var i = 0, len = me.stageStack.length; i < len; i++) {
                me.stageStack[i].clean();
            }
            me.stages = {};
            me.stageStack = [];
        }

    };

    util.inherits(Game, Event);

    return Game;

});
