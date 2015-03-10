/**
 * @file Game 类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var ig = require('ig');
    var Event = require('./Event');
    var util = require('./util');

    function Game(opts) {
        Event.apply(this, arguments);
        // 暂停
        this.paused = false;

        // 游戏的事件监听器
        // this.listeners = [];
    }

    Game.prototype = {
        /**
         * 还原 constructor
         *
         * @type {[type]}
         */
        constructor: Game,

        /**
         * 添加一个监听器
         *
         * @param {Object} ln 监听器对象
         */
        addListener: function (ln) {
            this.listeners.push(ln);
        },

        /**
         * 清除所有监听器
         */
        clearListener: function () {
            this.listeners.length = 0;
        },

        /**
         * Game 的 render，在这里，需要做的事情是触发各个事件，以及渲染场景
         * 而精灵的渲染是通过场景的渲染来渲染的，精灵的渲染和 Game 的渲染是没有关系的
         */
        render: function () {
            var me = this;
            me.fire('Game:beforeRender', {
                data: {
                    curFrame: ig.frameMonitor.cur, // 当前实时帧数
                    maxFrame: ig.frameMonitor.max, // 最大帧数
                    minFrame: ig.frameMonitor.min  // 最小帧数
                }
            });

            // do things

            me.fire('Game:afterRender', {
                data: {
                    curFrame: ig.frameMonitor.cur, // 当前实时帧数
                    maxFrame: ig.frameMonitor.max, // 最大帧数
                    minFrame: ig.frameMonitor.min  // 最小帧数
                }
            });
        },

        /**
         * 游戏开始
         *
         * @param {number} fps 每秒帧数，默认 60
         */
        start: function (fps) {
            var me = this;
            fps = fps || 60;
            var spf = (1000 / fps) | 0;
            ig.frameMonitor.start(); // 启动帧状态检测
            me.timer = setInterval(function () {
                ig.frameMonitor.update(); // 更新帧状态
                if (!me.paused) {
                    me.render();
                }
            }, spf);
        },

        /**
         * 游戏暂停
         */
        pause: function () {
            this.paused = true;
        },

        /**
         * 游戏重新开始
         */
        unpause: function () {
            this.paused = false;
        },

        /**
         * 停止游戏
         */
        stop: function () {
            clearInterval(this.timer);
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
