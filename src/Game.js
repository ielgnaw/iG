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
    var ResourceLoader = require('./ResourceLoader');
    // console.warn(resourceLoader);

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
            // 游戏的资源，初始化 game 的时候，这里面是待加载的资源，加载完成后，这里面放的是加载好的
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

        start: function () {
            // console.warn(1);
            preLoadResource.call(this);
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
        }
    };

    /**
     * 当前 Game 实例的资源的预加载
     */
    function preLoadResource() {
        var me = this;
        me.loadResource(
            me.resource,
            function (data) {
                me.asset = data;
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

        setOffCanvas.call(this);

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
