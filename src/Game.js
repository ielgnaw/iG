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
        this.p = {};

        util.extend(true, this.p, {
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

        if (!this.p.canvas) {
            throw new Error('Game initialize must be require a canvas param');
        }

        // 暂停
        this.p.paused = false;

        // 当前游戏实例中的所有场景，堆栈，后进先出
        this.p.stageStack = [];

        // 当前游戏实例中的所有场景，对象，方便读取
        this.p.stages = {};

        initGame.call(this);

        // 私有属性
        this._ = {};

        // this.resources 和 this.p.resources 同时指向 resourceLoader.resources 以及 ig.resources
        this.resources = this.p.resources = resourceLoader.resources;

        Event.apply(this, this.p);

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
            var p = this.p;
            p.paused = false;

            _.startTime = Date.now();
            _.now = 0;
            _.interval = 1000 / p.fps;
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
                var stageStack = p.stageStack;
                var candidateIndex = -1;
                for (var i = 0, len = stageStack.length; i < len; i++) {
                    if (stageStack[i].p.name === _startStageName) {
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
            var p = me.p;
            var _ = me._;

            _.requestID = window.requestAnimationFrame(
                (function (context) {
                    return function () {
                        context.render.call(context);
                    };
                })(me)
            );

            if (!p.paused) {

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
            this.p.paused = true;
            return this;
        },

        /**
         * 从暂停状态恢复
         * @return {Object} Game 实例
         */
        resume: function () {
            this.p.paused = false;
            return this;
        },

        /**
         * 停止游戏
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
            var p = this.p;

            stageOpts = util.extend(true, {},
                {
                    canvas: p.canvas,
                    offCanvas: p.offCanvas,
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
            var p = this.p;
            if (!this.getStageByName(stage.name)) {
                stage.gameOwner = this;
                p.stageStack.push(stage);
                p.stages[stage.p.name] = stage;
                this.sortStageIndex();
            }
        },

        /**
         * 场景出栈
         */
        popStage: function () {
            var p = this.p;
            var stage = p.stageStack.pop();
            if (stage) {
                delete p.stages[stage.name];
                this.sortStageIndex();
            }
        },

        /**
         * 场景排序
         */
        sortStageIndex: function () {
            var stageStack = this.p.stageStack;
            // for (var i = 0, len = stageStack.length; i < len; i++) {
            for (var i = stageStack.length - 1, j = 0; i >= 0; i--, j++) {
                stageStack[i].p.zIndex = j;
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
                var p = this.p;
                delete p.stages[st.name];
                var stageStack = p.stageStack;
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
            var p = this.p;
            // return p.stageStack[p.stageStack.length - 1];
            return p.stageStack[0];
        },

        /**
         * 获取当前游戏里面的所有场景
         *
         * @return {Array} 所有场景集合
         */
        getStageStack: function () {
            return this.p.stageStack;
        },

        /**
         * 根据场景名字获取场景对象
         *
         * @param {string} name 场景名字
         *
         * @return {Object} 场景对象
         */
        getStageByName: function (name) {
            return this.p.stages[name];
        },

        /**
         * 根据名字切换场景
         *
         * @param {string} stageName 场景名字
         */
        changeStage: function (stageName) {
            var p = this.p;
            if (stageName) {
                var stageStack = p.stageStack;
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
         * 交换场景位置
         *
         * @param {number} from 起始位置
         * @param {number} to 目标位置
         */
        swapStage: function (from, to) {
            var p = this.p;
            var stageStack = p.stageStack;
            var len = stageStack.length;
            if (from >= 0 && from <= len - 1
                    && to >= 0 && to <= len - 1
            ) {
                var sc = stageStack[from];
                stageStack[from] = stageStack[to];
                stageStack[to] = sc;
                this.sortStageIndex();
            }

            // 变换场景时，需要清除 this.p.canvas
            p.ctx.clearRect(0, 0, p.canvas.width, p.canvas.height);
        },

        /**
         * 获取场景的 zIndex，场景的排序实际上就是变化 zIndex
         *
         * @param {Object} stage 场景对象
         *
         * @return {number} zIndex
         */
        getStageIndex: function (stage) {
            return stage.p.zIndex;
        },

        /**
         * 清除所有场景
         */
        clearAllStage: function () {
            var p = this.p;
            p.stages = {};
            p.stageStack = [];
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
        var p = this.p;
        p.canvas = util.domWrap(p.canvas, document.createElement('div'), 'ig-game-container-' + p.name);
        p.canvas.width = p.width;
        p.canvas.height = p.height;

        var width = parseInt(p.canvas.width, 10);
        var height = parseInt(p.canvas.height, 10);

        var maxWidth = p.maxWidth || 5000;
        var maxHeight = p.maxHeight || 5000;

        if (p.maximize) {
            document.body.style.padding = 0;
            document.body.style.margin = 0;

            var horizontalPageScroll;
            var horizontalPageScrollType = util.getType(p.horizontalPageScroll);

            if (horizontalPageScrollType === 'number') {
                horizontalPageScroll = p.horizontalPageScroll;
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
            p.canvas.style.height = (height * 2) + 'px';
            window.scrollTo(0, 1);

            width = Math.min(window.innerWidth, maxWidth);
            height = Math.min(window.innerHeight, maxHeight);
        }

        p.ctx = p.canvas.getContext('2d');
        p.canvas.style.height = height + 'px';
        p.canvas.style.width = width + 'px';
        p.canvas.width = width;
        p.canvas.height = height;
        p.canvas.style.position = 'relative';

        p.width = p.canvas.width;
        p.cssWidth = p.canvas.style.width;

        p.height = p.canvas.height;
        p.cssHeight = p.canvas.style.height;

        setOffCanvas.call(this);

        var canvasParent = p.canvas.parentNode;
        canvasParent.style.width = width + 'px';
        canvasParent.style.margin = '0 auto';
        canvasParent.style.position = 'relative';

        // 是否需要在页面加载时候执行 fitScreen ?
        if (p.scaleFit) {
            fitScreen.call(this);
        }

        var me = this;
        window.addEventListener(
            env.supportOrientation ? 'orientationchange' : 'resize',
            function () {
                setTimeout(function () {
                    window.scrollTo(0, 1);
                    if (p.scaleFit) {
                        fitScreen.call(me);
                    }
                }, 0);
            },
            false
        );

        p.ratioX = p.width / STANDARD_WIDTH;
        p.ratioY = p.height / STANDARD_HEIGHT;

        return this;
    }

    /**
     * 设置离屏 canvas
     */
    function setOffCanvas() {
        var p = this.p;
        if (!p.offCanvas) {
            p.offCanvas = document.createElement('canvas');
            p.offCtx = p.offCanvas.getContext('2d');
        }

        p.offCanvas.width = p.canvas.width;
        p.offCanvas.style.width = p.canvas.style.width;
        p.offCanvas.height = p.canvas.height;
        p.offCanvas.style.height = p.canvas.style.height;
    }

    /**
     * 屏幕适配
     */
    function fitScreen() {
        var p = this.p;
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        var winRatio = winWidth / winHeight;
        var gameRatio = p.canvas.width / p.canvas.height;
        var scaleRatio = gameRatio < winRatio ? winHeight / p.canvas.height : winWidth / p.canvas.width;
        var scaleWidth = p.canvas.width * scaleRatio;
        var scaleHeight = p.canvas.height * scaleRatio;

        p.canvas.style.width = scaleWidth + 'px';
        p.canvas.style.height = scaleHeight + 'px';

        if (p.canvas.parentNode) {
            p.canvas.parentNode.style.width = scaleWidth + 'px';
            p.canvas.parentNode.style.height = scaleHeight + 'px';
        }

        if (gameRatio >= winRatio) {
            var topPos = (winHeight - scaleHeight) / 2;
            p.canvas.style.top = topPos + 'px';
        }

        p.width = p.canvas.width;
        p.cssWidth = p.canvas.style.width;

        p.height = p.canvas.height;
        p.cssHeight = p.canvas.style.height;

        // 这个 scaleRatio 是指屏幕适配的 ratio
        p.scaleRatio = scaleRatio;

        setOffCanvas.call(this);
    }

    util.inherits(Game, Event);

    return Game;
});
