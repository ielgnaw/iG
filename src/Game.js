/**
 * @file Game 类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var Event = require('./Event');
    var util = require('./util');

    var FrameMonitor = require('./FrameMonitor');

    function Game() {
        Event.apply(this, arguments);
        // 暂停
        this.paused = false;

        // 一个游戏对应一个 FrameMonitor 的实例
        this.curGameFrameMonitor = new FrameMonitor();
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

            // do things

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
        start: function (fps) {
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
        play: function () {
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
         * 给游戏设置场景管理器
         *
         * @param {Object} stageManager 场景管理器
         */
        setStageManager: function (stageManager) {
            this.stageManager = stageManager;
        }
    };

    util.inherits(Game, Event);

    return Game;

});
