/**
 * @file Game 类
 * 游戏的主启动在这里，渲染过程：
 * Game: render --> Stage: render --> DisplayObject: render
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var Event = require('./Event');
    var util = require('./util');
    var env = require('./env');
    var Stage = require('./Stage');

    var resourceLoader = require('./resourceLoader');

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
     * 宽度的默认值
     *
     * @type {number}
     */
    var STANDARD_WIDTH = 320;

    /**
     * 最大宽度的默认值
     *
     * @type {number}
     */
    var MAX_WIDTH = 5000;

    /**
     * 高度的默认值
     *
     * @type {number}
     */
    var STANDARD_HEIGHT = 480;

    /**
     * 最大高度的默认值
     *
     * @type {number}
     */
    var MAX_HEIGHT = 5000;

    /**
     * Game 类，一个游戏应该对这个游戏中的场景进行管理
     *
     * @constructor
     *
     * @return {Object} 当前游戏实例
     */
    function Game(opts) {
        // 属性全部挂载在 p 这个属性下，避免实例上挂载的属性太多，太乱
        util.extend(true, this, {
            // 名称
            name: 'ig_game_' + (GUID_KEY++),
            // fps
            fps: DEFAULT_FPS,
            // canvas DOM
            canvas: null,
            // 是否最大化，全屏通常只用设置 opts.maximize = true
            maximize: false,
            // 屏幕大小变化自动适应
            scaleFit: true,
            // 宽度
            width: STANDARD_WIDTH,
            // 高度
            height: STANDARD_HEIGHT,
            // 最大宽度
            maxWidth: MAX_WIDTH,
            // 最大高度
            maxHeight: MAX_HEIGHT,
            // 给页面竖向滚动条留下的宽度，当 maximize = true 时生效
            // horizontalPageScroll = true 时，值为 17 ；horizontalPageScroll = number 时，值为 number
            horizontalPageScroll: null
        }, opts);

        if (!this.canvas) {
            throw new Error('Game initialize must be require a canvas param');
        }

        // 暂停
        this.paused = false;

        // 当前游戏实例中的所有场景，堆栈，后进先出
        this.stageStack = [];

        // 当前游戏实例中的所有场景，对象，方便读取
        this.stages = {};

        initGame.call(this);

        // 私有属性
        this._ = {};

        // this.resources 同时指向 resourceLoader.resources 以及 ig.resources
        this.resources = resourceLoader.resources;

        return this;
    }

    Game.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Game,

        /**
         * 游戏开始
         *
         * @param {string} startStageName 游戏开始时指定的场景名
         * @param {Function} startCallback 游戏开始的回调函数
         *
         * @return {Object} Game 实例
         */
        start: function (startStageName, startCallback) {
            // 私有属性的引用
            var _ = this._;
            this.paused = false;

            _.startTime = Date.now();
            _.now = 0;
            _.interval = 1000 / this.fps;
            _.delta = 0;

            _.realFpsStart = Date.now();
            _.realFps = 0;
            _.realDelta = 0;

            _.totalFrameCounter = 0;

            var _startStageName = '';
            var _startCallback = util.noop;

            var argLength = arguments.length;
            switch (argLength) {
                case 1:
                    if (util.getType(arguments[0]) === 'function') {
                        _startCallback = arguments[0];
                    }
                    else {
                        _startStageName = arguments[0];
                        _startCallback = util.noop;
                    }
                    break;
                case 2:
                    _startStageName = arguments[0];
                    _startCallback = arguments[1];
                    break;
                default:
            }

            // 存在启动的 stage，那么游戏开始时就要用这个 stage 启动
            // 需要把这个 stage 移动到 stageStack 的第 0 个，因为 render 的是获取场景是通过 getCurrentStage 来获取的
            if (_startStageName) {
                var stageStack = this.stageStack;
                var candidateIndex = -1;
                for (var i = 0, len = stageStack.length; i < len; i++) {
                    if (stageStack[i].name === _startStageName) {
                        candidateIndex = i;
                        break;
                    }
                }
                this.swapStage(candidateIndex, 0);
            }

            // 启动前先停止
            this.stop();

            var me = this;
            // _.requestID = window.requestAnimationFrame(function () {
            me.render.call(me, _startStageName);
            // });

            util.getType(_startCallback) === 'function' && _startCallback.call(me, {
                data: {
                    startTime: _.startTime,
                    interval: _.interval
                }
            });

            return this;
        },

        /**
         * Game 的 render，在这里，需要做的事情是触发各个事件，以及渲染场景
         * 而精灵的渲染是通过场景的渲染来渲染的，精灵的渲染和 Game 的渲染是没有关系的
         */
        render: function () {
            var me = this;
            var _ = me._;

            _.requestID = window.requestAnimationFrame(
                (function (context) {
                    return function () {
                        context.render.call(context);
                    };
                })(me)
            );

            if (!this.paused) {

                _.now = Date.now();
                _.delta = _.now - _.startTime; // 时间差即每帧的时间间隔

                if (_.delta > _.interval) {
                    // 总帧数的计数器，这里设置这个是为了后续场景精灵等 render 的时候作为 interval 来使用
                    _.totalFrameCounter++;

                    // 仅仅 `_.startTime = _.now` 的判断是不够的，
                    // 例如设置 fps = 10，意味着每帧必须是 100ms，而现在帧执行时间是 16ms (60 fps)
                    // 所以需要循环 7 次 (16 * 7 = 112ms) 才能满足 `_.delta > _.interval === true`。
                    // 这会导致降低了FPS， 112 * 10 = 1120ms (不是 1000ms)
                    // 因此这里 `_.delta % _.interval`
                    _.startTime = _.now - (_.delta % _.interval);

                    me.fire('beforeGameRender', {
                        data: {
                            startTime: _.startTime,
                            totalFrameCounter: _.totalFrameCounter
                        }
                    });

                    var curStage = me.getCurrentStage();

                    if (curStage) {
                        curStage.update(_.totalFrameCounter, _.delta / 1000);
                        curStage.render();
                    }

                    me.fire('afterGameRender', {
                        data: {
                            startTime: _.startTime,
                            totalFrameCounter: _.totalFrameCounter
                        }
                    });
                }

                if (_.realDelta > 1000) {
                    _.realFpsStart = Date.now();
                    _.realDelta = 0;
                    me.fire('gameFPS', {
                        data: {
                            fps: _.realFps,
                            totalFrameCounter: _.totalFrameCounter
                        }
                    });

                    _.realFps = 0;
                }
                else {
                    _.realDelta = Date.now() - _.realFpsStart;
                    ++_.realFps;
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
         *
         * @return {Object} Game 实例
         */
        stop: function () {
            window.cancelAnimationFrame(this._.requestID);
            return this;
        },

        /**
         * 销毁
         */
        destroy: function () {
            this.stop();
            this.clearAllStage();
            this.clearEvents();
        },

        /**
         * 创建一个场景
         *
         * @param {Object} stageOpts 创建场景所需的参数
         *
         * @return {Object} 创建的场景对象
         */
        createStage: function (stageOpts) {
            stageOpts = util.extend(true, {},
                {
                    canvas: this.canvas,
                    offCanvas: this.offCanvas,
                    gameOwner: this
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
            if (!this.getStageByName(stage.name)) {
                stage.gameOwner = this;
                this.stageStack.push(stage);
                this.stages[stage.name] = stage;
                this.sortStageIndex();
            }
        },

        /**
         * 场景出栈
         */
        popStage: function () {
            var stage = this.stageStack.pop();
            if (stage) {
                delete this.stages[stage.name];
                this.sortStageIndex();
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
            var st = this.getStageByName(name);
            if (st) {
                delete this.stages[st.name];
                var stageStack = this.stageStack;
                util.removeArrByCondition(stageStack, function (s) {
                    return s.name === name;
                });
                this.sortStageIndex();
            }
        },

        /**
         * 获取当前场景，栈的第一个为当前场景
         *
         * @return {Object} 场景对象
         */
        getCurrentStage: function () {
            // return this.stageStack[this.stageStack.length - 1];
            return this.stageStack[0];
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
         * 根据名字切换场景
         *
         * @param {string} stageName 场景名字
         */
        changeStage: function (stageName) {
            if (stageName) {
                var stageStack = this.stageStack;
                var candidateIndex = -1;
                for (var i = 0, len = stageStack.length; i < len; i++) {
                    if (stageStack[i].name === stageName) {
                        candidateIndex = i;
                        break;
                    }
                }
                this.swapStage(candidateIndex, 0);
            }
        },

        /**
         * 根据场景名称交换场景
         *
         * @param {string} fromName 起始场景的名称
         * @param {string} toName 目标场景的名称
         *
         * @return {Object} Game 实例
         */
        swapStageByName: function (fromName, toName) {
            var stageStack = this.stageStack;
            var length = stageStack.length;
            var fromIndex = -1;
            var toIndex = -1;
            for (var i = 0; i < length; i++) {
                if (stageStack[i].name === fromName) {
                    fromIndex = i;
                }
                if (stageStack[i].name === toName) {
                    toIndex = i;
                }
            }

            if (fromIndex !== -1 && toIndex !== -1) {
                return this.swapStage(fromIndex, toIndex);
            }

            return this;
        },

        /**
         * 根据位置交换场景
         *
         * @param {number} from 起始位置
         * @param {number} to 目标位置
         *
         * @return {Object} Game 实例
         */
        swapStage: function (from, to) {
            var stageStack = this.stageStack;
            var len = stageStack.length;
            if (from >= 0 && from <= len - 1
                    && to >= 0 && to <= len - 1
            ) {
                var sc = stageStack[from];
                stageStack[from] = stageStack[to];
                stageStack[to] = sc;
                this.sortStageIndex();
            }

            // 变换场景时，需要清除 this.canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return this;
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
         * 清除所有场景
         */
        clearAllStage: function () {
            var stageStack = this.stageStack;
            for (var i = 0, len = stageStack.length; i < len; i++) {
                stageStack[i].destroy();
            }
            this.stages = {};
            this.stageStack = [];
        },

        /**
         * 加载其他资源
         *
         * @param {string} id 图片 id
         * @param {string} src 图片路径
         * @param {Function} callback 加载成功回调
         * @param {Function} errorCallback 加载失败回调
         */
        loadOther: function (id, src, callback, errorCallback) {
            return resourceLoader.loadOther(id, src, callback, errorCallback);
        },

        /**
         * 加载图片
         *
         * @param {string} id 图片 id
         * @param {string} src 图片路径
         * @param {Function} callback 加载成功回调
         * @param {Function} errorCallback 加载失败回调
         */
        loadImage: function (id, src, callback, errorCallback) {
            return resourceLoader.loadImage(id, src, callback, errorCallback);
        },

        /**
         * 加载资源，资源格式为: {id: 'xxxx', src: 'path'} 或 'path'
         *
         * @param {Array | string} resource 资源
         * @param {Function} callback 全部加载完成回调
         * @param {Object} opts 参数配置
         * @param {Function} opts.processCallback 加载每一项完成的回调
         * @param {Object} opts.customResourceTypes 自定义的资源配置，opts.customResourceTypes = {'bmp': 'Image'}
         */
        loadResource: function (resource, callback, opts) {
            return resourceLoader.loadResource(resource, callback, opts);
        }
    };

    /**
     * game 初始化
     *
     * @return {Object} 当前 Game 实例
     */
    function initGame() {
        this.canvas = util.domWrap(this.canvas, document.createElement('div'), 'ig-game-container-' + this.name);
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        var width = parseInt(this.canvas.width, 10);
        var height = parseInt(this.canvas.height, 10);

        var maxWidth = this.maxWidth || 5000;
        var maxHeight = this.maxHeight || 5000;

        if (this.maximize) {
            document.body.style.padding = 0;
            document.body.style.margin = 0;

            var horizontalPageScroll;
            var horizontalPageScrollType = util.getType(this.horizontalPageScroll);

            if (horizontalPageScrollType === 'number') {
                horizontalPageScroll = this.horizontalPageScroll;
            }
            else if (horizontalPageScrollType === 'boolean') {
                horizontalPageScroll = 17;
            }
            else {
                horizontalPageScroll = 0;
            }

            width = Math.min(window.innerWidth, maxWidth) - horizontalPageScroll;
            height = Math.min(window.innerHeight - 5, maxHeight);
        }

        if (env.supportTouch) {
            this.canvas.style.height = (height * 2) + 'px';
            window.scrollTo(0, 1);

            width = Math.min(window.innerWidth, maxWidth);
            height = Math.min(window.innerHeight, maxHeight);
        }

        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.height = height + 'px';
        this.canvas.style.width = width + 'px';
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.position = 'relative';

        this.width = this.canvas.width;
        this.cssWidth = this.canvas.style.width;

        this.height = this.canvas.height;
        this.cssHeight = this.canvas.style.height;

        setOffCanvas.call(this);

        var canvasParent = this.canvas.parentNode;
        canvasParent.style.width = width + 'px';
        canvasParent.style.margin = '0 auto';
        canvasParent.style.position = 'relative';

        // 是否需要在页面加载时候执行 fitScreen ?
        if (this.scaleFit) {
            fitScreen.call(this);
        }

        var me = this;
        window.addEventListener(
            env.supportOrientation ? 'orientationchange' : 'resize',
            function () {
                setTimeout(function () {
                    window.scrollTo(0, 1);
                    if (me.scaleFit) {
                        fitScreen.call(me);
                    }
                }, 0);
            },
            false
        );

        this.ratioX = this.width / STANDARD_WIDTH;
        this.ratioY = this.height / STANDARD_HEIGHT;

        return this;
    }

    /**
     * 设置离屏 canvas
     */
    function setOffCanvas() {
        if (!this.offCanvas) {
            this.offCanvas = document.createElement('canvas');
            this.offCtx = this.offCanvas.getContext('2d');
        }

        this.offCanvas.width = this.canvas.width;
        this.offCanvas.style.width = this.canvas.style.width;
        this.offCanvas.height = this.canvas.height;
        this.offCanvas.style.height = this.canvas.style.height;
    }

    /**
     * 屏幕适配
     */
    function fitScreen() {
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        var winRatio = winWidth / winHeight;
        var gameRatio = this.canvas.width / this.canvas.height;
        var scaleRatio = gameRatio < winRatio ? winHeight / this.canvas.height : winWidth / this.canvas.width;
        var scaleWidth = this.canvas.width * scaleRatio;
        var scaleHeight = this.canvas.height * scaleRatio;

        this.canvas.style.width = scaleWidth + 'px';
        this.canvas.style.height = scaleHeight + 'px';

        if (this.canvas.parentNode) {
            this.canvas.parentNode.style.width = scaleWidth + 'px';
            this.canvas.parentNode.style.height = scaleHeight + 'px';
        }

        if (gameRatio >= winRatio) {
            var topPos = (winHeight - scaleHeight) / 2;
            this.canvas.style.top = topPos + 'px';
        }

        this.width = this.canvas.width;
        this.cssWidth = this.canvas.style.width;

        this.height = this.canvas.height;
        this.cssHeight = this.canvas.style.height;

        // 这个 scaleRatio 是指屏幕适配的 ratio
        this.scaleRatio = scaleRatio;

        setOffCanvas.call(this);
    }

    util.inherits(Game, Event);

    return Game;
});
