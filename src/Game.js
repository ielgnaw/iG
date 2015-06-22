/**
 * @file Game 类
 * 游戏的主启动在这里，渲染过程：
 * Game: render --> Stage: render --> DisplayObject: render
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var ig = require('./ig');
    var Event = require('./Event');
    var util = require('./util');
    var env = require('./env');
    var Stage = require('./Stage');
    var ResourceLoader = require('./ResourceLoader');

    var CONFIG = ig.getConfig();

    /**
     * 名字标示
     *
     * @type {number}
     */
    var GUID_KEY = 0;

    /**
     * Game 类，一个游戏应该对这个游戏中的场景进行管理
     * 把 CONFIG 中的配置移植到 Game 实例上，后续全部从 Game 实例获取，确保每个 Game 是独立的配置
     *
     * @constructor
     *
     * @param {Object} opts 参数对象
     *
     * @return {Object} 当前游戏实例
     */
    function Game(opts) {
        // 属性全部挂载在 p 这个属性下，避免实例上挂载的属性太多，太乱
        util.extend(true, this, {
            // 名称
            name: 'ig_game_' + (GUID_KEY++),
            // canvas DOM
            canvas: null,
            // 是否最大化，全屏通常只用设置 opts.maximize = true
            maximize: false,
            // 屏幕大小变化自动适应
            scaleFit: true,
            // 游戏的资源，这里面是待加载的资源
            resource: [],
            // fps
            fps: CONFIG.fps,
            // 宽度
            width: CONFIG.width,
            // 高度
            height: CONFIG.height,
            // 最大宽度
            maxWidth: CONFIG.maxWidth,
            // 最大高度
            maxHeight: CONFIG.maxHeight,
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

        // 私有属性
        this._ = {};

        // 当前 Game 实例的 resourceLoader
        this.resourceLoader = new ResourceLoader();

        initGame.call(this);

        return this;
    }

    Game.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Game,

        /**
         * 停止游戏
         *
         * @return {Object} Game 实例
         */
        stop: function () {
            window.cancelAnimationFrame(this._.requestID);
            this._.requestID = null;
            return this;
        },

        /**
         * 游戏开始
         *
         * @param {string} startStageName 游戏开始时指定的场景名
         * @param {Function} startCallback 游戏开始的回调函数
         *
         * @return {Object} Game 实例
         */
        start: function (startStageName, startCallback) {
            var _startStageName = '';
            var _startCallback = util.noop;
            this.canStart = false;

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

            // 资源加载完成后，做引擎内部的 start 工作
            preLoadResource.call(this, function () {
                // 启动前先停止
                this.stop();

                this.paused = false;

                // 存在启动的 stage，那么游戏开始时就要用这个 stage 启动
                // 需要把这个 stage 移动到 stageStack 的第 0 个，因为 render 时获取场景是通过 getCurrentStage 来获取的
                if (_startStageName && this.stages[_startStageName]) {
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
                // 不存在，那么启动的场景就是第一个场景
                else {
                    _startStageName = this.getCurrentStage().name;
                }

                var curStage = this.getStageByName(_startStageName);
                curStage && _gameStartExec.call(this, curStage);

                util.getType(_startCallback) === 'function' && _startCallback.call(this);

            });

            return this;
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
            var _id;
            var _src;
            var _callback;
            var _errorCallback;

            var argLength = arguments.length;
            switch (argLength) {
                case 1:
                    _id = _src = arguments[0];
                    _callback = _errorCallback = util.noop;
                    break;
                case 2:
                    _id = _src = arguments[0];
                    _callback = _errorCallback = arguments[1];
                    break;
                case 3:
                    _id = _src = arguments[0];
                    _callback = arguments[1];
                    _errorCallback = arguments[2];
                    break;
                default:
                    _id = arguments[0];
                    _src = arguments[1];
                    _callback = arguments[2];
                    _errorCallback = arguments[3];
            }

            this.resourceLoader.loadOther(_id, _src, _callback, _errorCallback);
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
            var _id;
            var _src;
            var _callback;
            var _errorCallback;

            var argLength = arguments.length;
            switch (argLength) {
                case 1:
                    _id = _src = arguments[0];
                    _callback = _errorCallback = util.noop;
                    break;
                case 2:
                    _id = _src = arguments[0];
                    _callback = _errorCallback = arguments[1];
                    break;
                case 3:
                    _id = _src = arguments[0];
                    _callback = arguments[1];
                    _errorCallback = arguments[2];
                    break;
                default:
                    _id = arguments[0];
                    _src = arguments[1];
                    _callback = arguments[2];
                    _errorCallback = arguments[3];
            }
            this.resourceLoader.loadImage(_id, _src, _callback, _errorCallback);
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
            this.resourceLoader.loadResource(resource, callback, opts);
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
                    game: this
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
                stage.game = this;
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
         * popStage 清除的是栈顶的那一个
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
        }
    };

    /**
     * stage 背景颜色和背景图片的处理
     * 设置启动场景的背景颜色、图片等等
     *
     * @param {Object} stage 启动的场景对象
     */
    function _stageBg(stage) {
        stage.setBgColor(stage.bgColor);
        if (stage.bgImg) {
            stage.setBgImg(stage.bgImg, stage.bgImgRepeatPattern);
        }
    }

    /**
     * stage 背景时差滚动的处理
     * 设置启动场景的背景颜色、图片等等
     *
     * @param {Object} stage 启动的场景对象
     */
    function _stageParallax(stage) {
        var parallaxOpts = stage.parallaxOpts;
        stage.setParallax(parallaxOpts);
    }

    /**
     * 给 stage 里的 displayObject 设置 asset
     *
     * @param {Object} stage 场景对象
     */
    function _displayObjectAsset(stage) {
        var asset = this.asset;
        var resource = this.resource;
        var displayObjectList = stage.displayObjectList;
        for (var i = 0, len = displayObjectList.length; i < len; i++) {
            var displayObject = displayObjectList[i];
            // 只检测需要图片的 DisplayObject 例如 bitmap, spriteSheet 等
            // 像 text 等构造函数里面不需要 image 参数的就不检测了
            if (displayObject instanceof ig.Bitmap
                || displayObject instanceof ig.BitmapPolygon
                || displayObject instanceof ig.SpriteSheet
            ) {
                var imageAsset = util.getImgAsset(displayObject.image, asset, resource);
                if (!imageAsset) {
                    throw new Error(''
                        + displayObject.name
                        + '\'s'
                        + ' image: `'
                        + displayObject.image
                        + '` is not in game.asset'
                    );
                }
                displayObject.asset = imageAsset;
            }

            if (displayObject instanceof ig.SpriteSheet) {
                // spriteSheet Data 和 img 在 game.resource 中是一样的格式
                // 因此这里可以直接用检测图片的方式来检测 spriteSheet Data
                var sheetAsset = util.getImgAsset(displayObject.sheet, asset, resource);
                if (!sheetAsset) {
                    throw new Error(''
                        + displayObject.name
                        + '\'s'
                        + ' sheet: `'
                        + displayObject.sheet
                        + '` is not in game.asset'
                    );
                }
                displayObject.sheetData = sheetAsset;
            }
        }
    }

    /**
     * stage 启动的执行方法
     * 设置启动场景的背景颜色、图片等等
     *
     * @param {Object} stage 启动的场景对象
     */
    function _stageStartExec(stage) {
        _stageBg.call(this, stage);
        _stageParallax.call(this, stage);
        _displayObjectAsset.call(this, stage);
    }

    /**
     * game 启动的执行方法
     *
     * @param {Object} stage 启动的场景对象
     */
    function _gameStartExec(stage) {
        _stageStartExec.call(this, stage);

        var realFPS = 0;
        var realDt = 0;
        var realFPSStart = Date.now();

        var me = this;
        ig.loop({
            step: function (dt, stepCount, requestID) {
                if (!me.paused) {
                    if (realDt > 1000) {
                        realDt = 0;
                        realFPSStart = Date.now();
                        me.fire('gameFPS', {
                            data: {
                                fps: realFPS
                            }
                        });
                        realFPS = 0;
                    }
                    else {
                        realDt = Date.now() - realFPSStart;
                        ++realFPS;
                    }
                    me.fire('beforeGameStep');
                    stage.step(dt, stepCount, requestID);
                    me.fire('afterGameStep');
                }
            },
            exec: function (execCount) {
                if (!me.paused) {
                    me.fire('beforeGameRender');
                    stage.render(execCount);
                    me.fire('afterGameRender');
                }
            }
        });
    }

    /**
     * 当前 Game 实例的资源的预加载
     *
     * @param {Function} callback 加载完成后的回调函数（引擎内部的回调函数）
     */
    function preLoadResource(callback) {
        var me = this;
        if (Array.isArray(me.resource) && me.resource.length) {
            me.loadResource(
                me.resource,
                function (data) {
                    me.asset = data;
                    callback.call(me);
                    me.fire('loadResDone');
                },
                {
                    processCallback: function (loadedCount, total) {
                        me.fire('loadResProcess', {
                            data: {
                                loadedCount: loadedCount,
                                total: total
                            }
                        });
                    }
                }
            );
        }
        else {
            me.asset = {};
            callback.call(me);
            me.fire('loadResDone');
        }
    }

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

        var maxWidth = this.maxWidth;
        var maxHeight = this.maxHeight;

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
        this.cssWidth = this.canvas.style.height = height + 'px';
        this.cssHeight = this.canvas.style.width = width + 'px';
        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;
        this.canvas.style.position = 'relative';

        // setOffCanvas.call(this);

        var canvasParent = this.canvas.parentNode;
        canvasParent.style.width = width + 'px';
        canvasParent.style.margin = '0 auto';
        canvasParent.style.position = 'relative';

        var getRatio = function () {
            if (this.scaleFit) {
                fitScreen.call(this);
            }
            // 实际宽度和默认宽度的比值
            this.xRatio = this.width / CONFIG.width;
            // 实际高度和默认高度的比值
            this.yRatio = this.height / CONFIG.height;
            // 宽度和 css 宽度的比值
            this.cssXRatio = this.width / parseInt(this.cssWidth, 10);
            // 高度和 css 高度的比值
            this.cssYRatio = this.height / parseInt(this.cssHeight, 10);
        };

        getRatio.call(this);

        var me = this;
        window.addEventListener(
            env.supportOrientation ? 'orientationchange' : 'resize',
            function () {
                setTimeout(function () {
                    window.scrollTo(0, 1);
                    getRatio.call(me);
                }, 0);
            },
            false
        );

        return this;
    }

    /**
     * 设置离屏 canvas
     */
    // function setOffCanvas() {
    //     if (!this.offCanvas) {
    //         this.offCanvas = document.createElement('canvas');
    //         this.offCtx = this.offCanvas.getContext('2d');
    //     }

    //     this.offCanvas.width = this.canvas.width;
    //     this.offCanvas.style.width = this.canvas.style.width;
    //     this.offCanvas.height = this.canvas.height;
    //     this.offCanvas.style.height = this.canvas.style.height;
    // }

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

        // setOffCanvas.call(this);
    }

    util.inherits(Game, Event);

    return Game;

});
