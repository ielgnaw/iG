/**
 * @file Game 类
 * 游戏的主启动在这里，渲染过程：
 * Game: render --> Stage: render --> DisplayObject: render
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var ig = require('./ig');
    var util = require('./util');
    var env = require('./env');
    var Event = require('./Event');

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

        // 把 fps 设置到 CONFIG 中去，会动态改变 delta 的
        ig.setConfig('fps', this.fps);

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
        // this.resourceLoader = new ResourceLoader();

        initGame.call(this);
        // var stl = document.defaultView.getComputedStyle(this.canvas);

        // // FIXME Better way to get the width and height when element has not been append to the document
        // console.log(((this.canvas.clientWidth || parseInt(stl.width, 10) || parseInt(this.canvas.style.width, 10))
        //         - (parseInt(stl.paddingLeft, 10) || 0)
        //         - (parseInt(stl.paddingRight, 10) || 0)) | 0);

        return this;
    }

    /**
     * 屏幕适配
     */
    function fitScreen() {
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        var winRatio = winWidth / winHeight;

        var canvasRatio = this.canvas.width / this.canvas.height;

        var scaleRatio = canvasRatio < winRatio ? winHeight / this.canvas.height : winWidth / this.canvas.width;
        var scaleWidth = this.canvas.width * scaleRatio;
        var scaleHeight = this.canvas.height * scaleRatio;

        this.cssWidth = parseInt(scaleWidth, 10) + 'px';
        this.cssHeight = parseInt(scaleHeight, 10) + 'px';

        this.width = parseInt(this.cssWidth, 10) * env.dpr;
        this.height = parseInt(this.cssHeight, 10) * env.dpr;

        var containerStyle = this.container.style;
        containerStyle.width = this.cssWidth;
        containerStyle.height = this.cssHeight;

        var canvasStyle = this.canvas.style;
        canvasStyle.width = this.cssWidth;
        canvasStyle.height = this.cssHeight;
        if (canvasRatio >= winRatio) {
            var topPos = (winHeight - scaleHeight) / 2;
            this.canvas.style.top = topPos + 'px';
        }

        this.canvas.setAttribute('width', this.width);
        this.canvas.setAttribute('height', this.height);

        // 这个 scaleRatio 是指屏幕适配的 ratio
        this.scaleRatio = scaleRatio;

        window.scrollTo(0, 1);
    }

    /**
     * game 初始化
     *
     * @return {Object} 当前 Game 实例
     */
    function initGame() {
        this.container = util.domWrap(this.canvas, document.createElement('div'), 'ig-game-container-' + this.name);

        this.cssWidth = this.width + 'px';
        this.cssHeight = this.height + 'px';

        var containerStyle = this.container.style;

        if (this.maximize) {
            containerStyle.position = 'absolute';
            containerStyle.padding = 0;
            containerStyle.margin = 0;
            containerStyle.top = 0;
            containerStyle.bottom = 0;
            containerStyle.left = 0;
            containerStyle.right = 0;

            this.cssWidth = document.documentElement.clientWidth + 'px';
            this.cssHeight = document.documentElement.clientHeight + 'px';
        }

        this.width = parseInt(this.cssWidth, 10) * env.dpr;
        this.height = parseInt(this.cssHeight, 10) * env.dpr;

        containerStyle.width = this.cssWidth;
        containerStyle.height = this.cssHeight;
        containerStyle.position = 'relative';
        containerStyle.overflow = 'hidden';

        var canvasStyle = this.canvas.style;
        canvasStyle.width = this.cssWidth;
        canvasStyle.height = this.cssHeight;
        canvasStyle.position = 'absolute';

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.canvas['-webkit-user-select'] = 'none';
        this.canvas['user-select'] = 'none';
        this.canvas['-webkit-touch-callout'] = 'none';
        this.canvas['-webkit-tap-highlight-color'] = 'rgba(0, 0, 0, 0)';

        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(env.dpr, env.dpr);

        fitScreen.call(this);

        var me = this;
        window.addEventListener(
            env.supportOrientation ? 'orientationchange' : 'resize',
            function () {
                fitScreen.call(me);
            },
            false
        );

        return this;
    }

    var p = Game.prototype;

    // 这里应该是添加场景，然后由场景添加对象，这里只是测试
    p.add = function (obj) {
        obj.game = this;
        this.stageStack.push(obj);
        this.stages[obj.name] = obj;
    };

    p.start = function (stepFunc, execFunc, fps, loopId) {
        var q = ig.loop({
            step: stepFunc,
            render: execFunc,
            fps: fps
        });
    };

    p.stop = function () {
        ig.craf({
            loopId: this.loopId
        });
    };

    util.inherits(Game, Event);

    return Game;

});
