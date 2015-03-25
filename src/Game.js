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
    var env = require('./env');
    var Stage = require('./Stage');

    var _guid = 0;

    var _defaultFPS = 60;
    var _now;
    var _startTime;
    var _interval;
    var _delta; // 时间差即每帧的时间间隔

    var _realFpsStart;
    var _realFps;
    var _realDelta;

    var _totalFrameCounter; // 帧数的计数器

    /**
     * 屏幕适配
     */
    function fitScreen() {
        var me = this;
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        var winRatio = winWidth / winHeight;
        var gameRatio = me.canvas.width / me.canvas.height;
        var scaleRatio = gameRatio < winRatio ? winHeight / me.canvas.height : winWidth / me.canvas.width;
        var scaleWidth = me.canvas.width * scaleRatio;
        var scaleHeight = me.canvas.height * scaleRatio;

        me.canvas.style.width = scaleWidth + 'px';
        me.canvas.style.height = scaleHeight + 'px';

        if (me.canvas.parentNode) {
            me.canvas.parentNode.style.width = scaleWidth + 'px';
            me.canvas.parentNode.style.height = scaleHeight + 'px';
        }

        if (gameRatio >= winRatio) {
            var topPos = (winHeight - scaleHeight) / 2;
            me.canvas.style.top = topPos + 'px';
        }

        me.width = me.canvas.width;
        me.cssWidth = me.canvas.style.width;

        me.height = me.canvas.height;
        me.cssHeight = me.canvas.style.height;

        setOffCanvas.call(me);
    }

    /**
     * 设置离屏 canvas
     */
    function setOffCanvas() {
        var me = this;
        if (!me.offCanvas) {
            me.offCanvas = document.createElement('canvas');
            me.offCtx = me.offCanvas.getContext('2d');
        }

        me.offCanvas.width = me.canvas.width;
        me.offCanvas.style.width = me.canvas.style.width;
        me.offCanvas.height = me.canvas.height;
        me.offCanvas.style.height = me.canvas.style.height;
    }

    /**
     * Game 类，一个游戏应该对这个游戏中的场景进行管理
     *
     * @constructor
     */
    function Game(opts) {
        opts = opts || {};

        Event.apply(this, arguments);

        this.name = (opts.name === null || opts.name === void 0) ? 'ig_game_' + (_guid++) : opts.name;

        // 暂停
        this.paused = false;

        // 当前游戏实例中的所有场景，堆栈，后进先出
        this.stageStack = [];

        // 当前游戏实例中的所有场景，对象，方便读取
        this.stages = {};

        _defaultFPS = opts.fps || 60;
    }

    Game.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Game,

        /**
         * 初始化游戏，主要设置游戏画布的尺寸
         * 全屏通常只用设置 opts.maximize = true
         * 如果需要屏幕大小变化自动适应则设置 opts.scaleFit = true
         *
         * @param {Object} opts 参数配置
         * @param {boolean} opts.maximize 最大化
         * @param {boolean} opts.scaleFit 缩放自适应
         * @param {number} opts.width canvas 宽度
         * @param {number} opts.height canvas 高度
         * @param {number} opts.maxWidth canvas 最大宽度，主要和 window.innerWidth 比较
         * @param {number} opts.maxHeight canvas 最大高度，主要和 window.innerHeight 比较
         * @param {number | boolean} opts.pageScroll 给页面竖向滚动条留下的宽度,当 maximize = true 时生效
         *                          pageScroll = true 时，值为 17 ；pageScroll = number 时，值为 number
         *
         * @return {Object} Game 实例
         */
        init: function (opts) {
            var me = this;

            if (!opts.canvas) {
                throw new Error('Game init must be require a canvas param');
            }

            me.canvas = util.domWrap(opts.canvas, document.createElement('div'), 'ig-stage-container' + _guid);
            me.canvas.width = opts.width || 320;
            me.canvas.height = opts.height || 480;

            var width = parseInt(me.canvas.width, 10);
            var height = parseInt(me.canvas.height, 10);

            var maxWidth = opts.maxWidth || 5000;
            var maxHeight = opts.maxHeight || 5000;

            if (opts.maximize) {
                document.body.style.padding = 0;
                document.body.style.margin = 0;

                var pageScroll;
                var pageScrollType = util.getType(opts.pageScroll);

                if (pageScrollType === 'number') {
                    pageScroll = opts.pageScroll;
                }
                else if (pageScrollType === 'boolean') {
                    pageScroll = 17;
                }
                else {
                    pageScroll = 0;
                }

                width = opts.width || Math.min(window.innerWidth, maxWidth) - pageScroll;
                height = opts.height || Math.min(window.innerHeight - 5, maxHeight);
            }

            if (env.supportTouch) {
                me.canvas.style.height = (height * 2) + 'px';
                window.scrollTo(0, 1);

                width = Math.min(window.innerWidth, maxWidth);
                height = Math.min(window.innerHeight, maxHeight);
            }

            me.ctx = me.canvas.getContext('2d');
            me.canvas.style.height = height + 'px';
            me.canvas.style.width = width + 'px';
            me.canvas.width = width;
            me.canvas.height = height;
            me.canvas.style.position = 'relative';

            me.width = me.canvas.width;
            me.cssWidth = me.canvas.style.width;

            me.height = me.canvas.height;
            me.cssHeight = me.canvas.style.height;

            setOffCanvas.call(me);

            var canvasParent = me.canvas.parentNode;
            canvasParent.style.width = width + 'px';
            canvasParent.style.margin = '0 auto';
            canvasParent.style.position = 'relative';

            // 是否需要在页面加载时候执行 fitScreen ?
            // if (opts.scaleFit) {
            //     fitScreen.call(me);
            // }

            window.addEventListener(
                env.supportOrientation ? 'orientationchange' : 'resize',
                function () {
                    setTimeout(function () {
                        window.scrollTo(0, 1);
                        if (opts.scaleFit) {
                            fitScreen.call(me);
                        }
                    }, 0);
                },
                false
            );

            return me;

            // if (opts.maximize) {
            //     document.body.style.padding = 0;
            //     document.body.style.margin = 0;
            // }

            // if (env.supportTouch) {
            //     window.scrollTo(0, 1);
            // }
            // // debugger
            // if (opts.width) {
            //     defaultCanvasWidth = opts.width;
            // }

            // if (opts.height) {
            //     defaultCanvasHeight = opts.height;
            // }

            // me.canvas.width = defaultCanvasWidth;
            // me.canvas.height = defaultCanvasHeight;

            // me.container = me.canvas.parentNode;

            // fitScreen.call(me, me.container);

            // window.addEventListener(
            //     env.supportOrientation ? 'orientationchange' : 'resize',
            //     function () {
            //         setTimeout(function () {
            //             fitScreen.call(me, me.container);
            //         }, 100);
            //     },
            //     false
            // );
        },

        /**
         * 游戏开始
         *
         * @param {Function} startCallback 游戏开始的回调函数
         *
         * @return {Object} Game 实例
         */
        start: function (startStageName, startCallback) {
            var me = this;
            me.paused = false;

            _startTime = Date.now();
            _now = 0;
            _interval = 1000 / _defaultFPS;
            _delta = 0;

            _realFpsStart = Date.now();
            _realFps = 0;
            _realDelta = 0;

            _totalFrameCounter = 0;

            var __startStageName = '';
            var __startCallback = util.noop;

            var argLength = arguments.length;
            switch (argLength) {
                case 1:
                    if (util.getType(arguments[0]) === 'function') {
                        __startCallback = arguments[0];
                    }
                    else {
                        __startStageName = arguments[0];
                        __startCallback = util.noop;
                    }
                    break;
                case 2:
                    __startStageName = arguments[0];
                    __startCallback = arguments[1];
                    break;
                default:
            }

            // 存在启动的 stage，那么游戏开始时就要用这个 stage 启动
            // 需要把这个 stage 移动到 stageStack 的第 0 个，因为 render 的是获取场景是通过 getCurrentStage 来获取的
            if (__startStageName) {
                var stageStack = me.stageStack;
                var candidateIndex = -1;
                for (var i = 0, len = stageStack.length; i < len; i++) {
                    if (stageStack[i].name === __startStageName) {
                        candidateIndex = i;
                        break;
                    }
                }
                me.swapStage(candidateIndex, 0);
            }

            me.requestID = window.requestAnimationFrame(function () {
                me.render.call(me, __startStageName);
            });

            util.getType(__startCallback) === 'function' && __startCallback.call(me, {
                data: {
                    startTime: _startTime,
                    interval: _interval
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

                _now = Date.now();
                _delta = _now - _startTime; // 时间差即每帧的时间间隔

                if (_delta > _interval) {
                    // 总帧数的计数器，这里设置这个是为了后续场景精灵等 render 的时候作为 interval 来使用
                    _totalFrameCounter++;

                    // 仅仅 `_startTime = _now` 的判断是不够的，
                    // 例如设置 fps = 10，意味着每帧必须是 100ms，而现在帧执行时间是 16ms (60 fps)
                    // 所以需要循环 7 次 (16 * 7 = 112ms) 才能满足 `_delta > _interval === true`。
                    // 这会导致降低了FPS， 112 * 10 = 1120ms (不是 1000ms)
                    // 因此这里 `_delta % _interval`
                    _startTime = _now - (_delta % _interval);

                    me.fire('beforeGameRender', {
                        data: {
                            startTime: _startTime,
                            totalFrameCounter: _totalFrameCounter
                        }
                    });

                    var curStage = me.getCurrentStage();

                    if (curStage) {
                        curStage.update(_totalFrameCounter);
                        curStage.render();
                    }

                    me.fire('afterGameRender', {
                        data: {
                            startTime: _startTime,
                            totalFrameCounter: _totalFrameCounter
                        }
                    });
                }

                if (_realDelta > 1000) {
                    _realFpsStart = Date.now();
                    _realDelta = 0;
                    me.fire('gameFPS', {
                        data: {
                            fps: _realFps,
                            totalFrameCounter: _totalFrameCounter
                        }
                    });

                    _realFps = 0;
                }
                else {
                    _realDelta = Date.now() - _realFpsStart;
                    ++_realFps;
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
            var me = this;

            stageOpts = util.extend(
                {},
                {
                    canvas: me.canvas,
                    offCanvas: me.offCanvas,
                    game: me
                },
                stageOpts
            );

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
                // stage.clean();
                delete me.stages[stage.name];
                me.sortStageIndex();
            }
        },

        /**
         * 场景排序
         */
        sortStageIndex: function () {
            var stageStack = this.stageStack;
            // for (var i = 0, len = stageStack.length; i < len; i++) {
            for (var i = stageStack.length - 1, j = 0; i >= 0; i--, j++) {
                stageStack[i].zIndex = j;
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
                // st.clean();
                delete me.stages[st.name];
                var stageStack = me.stageStack;
                util.removeArrByCondition(stageStack, function (s) {
                    return s.name === name;
                });
                me.sortStageIndex();
            }
        },

        /**
         * 根据名字切换场景
         *
         * @param {string} stageName 场景名字
         */
        changeStage: function (stageName) {
            var me = this;
            if (stageName) {
                var stageStack = me.stageStack;
                var candidateIndex = -1;
                for (var i = 0, len = stageStack.length; i < len; i++) {
                    if (stageStack[i].name === stageName) {
                        candidateIndex = i;
                        break;
                    }
                }
                me.swapStage(candidateIndex, 0);
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

            // 变换场景时，需要清除 me.canvas
            me.ctx.clearRect(0, 0, me.canvas.width, me.canvas.height);
        },

        /**
         * 获取场景的 zIndex，场景的排序实际上就是变化 zIndex
         *
         * @param {Object} stage 场景对象
         *
         * @return {number} zIndex
         */
        getStageIndex: function (stage) {
            return stage.zIndex;
        },

        /**
         * 获取当前场景，栈的第一个为当前场景
         *
         * @return {Object} 场景对象
         */
        getCurrentStage: function () {
            var me = this;
            // return me.stageStack[me.stageStack.length - 1];
            return me.stageStack[0];
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
