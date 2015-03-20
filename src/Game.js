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

    var FrameMonitor = require('./FrameMonitor');

    var now;
    var then = Date.now();
    var interval;
    var delta;

    /**
     * Game 类
     * 一个游戏实例应该对应一个 FrameMonitor 的实例
     * 同时，一个游戏应该对这个游戏中的场景进行管理
     *
     * @constructor
     */
    function Game() {
        Event.apply(this, arguments);

        // 暂停
        this.paused = false;

        // 一个游戏对应一个 FrameMonitor 的实例
        this.curGameFrameMonitor = new FrameMonitor();

        // 当前游戏实例中的所有场景，堆栈，后进先出
        this.stageStack = [];

        // 当前游戏实例中的所有场景，对象，方便读取
        this.stages = {};
    }

    Game.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Game,

        /**
         * Game 的 render，在这里，需要做的事情是触发各个事件，以及渲染场景
         * 而精灵的渲染是通过场景的渲染来渲染的，精灵的渲染和 Game 的渲染是没有关系的
         */
        render: function () {
            var me = this;

            me.curGameFrameMonitor.update(); // 更新帧状态
            // console.warn(me.curGameFrameMonitor.cur);
            if (!me.paused) {
                me.requestID = window.requestAnimationFrame(function () {
                    me.render.call(me);
                });
            }

            me.fire('Game:beforeRender', {
                data: {
                    curFrame: me.curGameFrameMonitor.cur, // 当前实时帧数
                    maxFrame: me.curGameFrameMonitor.max, // 最大帧数
                    minFrame: me.curGameFrameMonitor.min  // 最小帧数
                }
            });

            var curStage = me.getCurrentStage();

            if (curStage) {
                now = Date.now();
                delta = now - then;
                if (me.curGameFrameMonitor.cur === 0) {
                    curStage.update();
                    curStage.render();
                }
                else {
                    interval = 1000 / me.curGameFrameMonitor.cur;

                    if (delta > interval) {
                        then = now - (delta % interval);
                        // console.log(then);
                        curStage.update();
                        curStage.render();
                    }
                }
            }

            me.fire('Game:afterRender', {
                data: {
                    curFrame: me.curGameFrameMonitor.cur, // 当前实时帧数
                    maxFrame: me.curGameFrameMonitor.max, // 最大帧数
                    minFrame: me.curGameFrameMonitor.min  // 最小帧数
                }
            });

        },

        /**
         * 游戏开始
         */
        start: function () {
            var me = this;
            me.paused = false;

            me.curGameFrameMonitor.reset(); // 重置帧状态监控
            me.requestID = window.requestAnimationFrame(function () {
                me.curGameFrameMonitor.start(); // 启动帧状态监控
                me.render.call(me);
            });
        },

        /**
         * 游戏暂停
         */
        pause: function () {
            this.paused = true;
        },

        /**
         * 从暂停状态恢复
         */
        resume: function () {
            var me = this;
            me.paused = false;
            me.requestID = window.requestAnimationFrame(function () {
                me.render.call(me);
            });
        },

        /**
         * 停止游戏
         */
        stop: function () {
            window.cancelAnimationFrame(this.requestID);
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
