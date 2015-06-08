/**
 * @file 场景类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var ig = require('./ig');
    var Event = require('./Event');
    var util = require('./util');
    // var DisplayObject = require('./DisplayObject');
    var domEvt = require('./domEvt');

    /**
     * 名字标示
     *
     * @type {number}
     */
    var GUID_KEY = 0;

    /**
     * Stage 类
     *
     * @constructor
     *
     * @param {Object} opts 参数对象
     *
     * @return {Object} Stage 实例
     */
    function Stage(opts) {
        util.extend(true, this, {
            // 名称
            name: 'ig_stage_' + (GUID_KEY++),
            // canvas DOM
            canvas: opts.canvas,
            // canvas context 2d
            ctx: opts.canvas.getContext('2d'),
            // 离屏 canvas
            offCanvas: opts.offCanvas,
            // 离屏 canvas context
            offCtx: opts.offCanvas.getContext('2d'),
            // 场景的宽度，实际上是游戏的宽度即 canvas.width
            width: opts.game.width,
            // 场景的高度，实际上是游戏的高度即 canvas.height
            height: opts.game.height,
            // 场景的 cssWidth
            cssWidth: opts.game.cssWidth,
            // 场景的 cssHeight
            cssHeight: opts.game.cssHeight,
            // 背景颜色
            bgColor: 'transparent',
            // 背景图片，图片的 id 或者路径
            bgImg: '',
            // 背景图片重复的模式，center: 居中; full: 拉伸; 默认平铺
            bgImgRepeatPattern: '',
            // 时差滚动，默认空数组，一个合法的配置如下：
            // [
            //      {
            //          image: 'bg', // 图片 id 或者路径
            //          repeat: '', // 是否重复，可选值: repeat, repeat-x, repeat-y ，默认 no-repeat
            //          x: 0, // 横坐标
            //          y: 0, // 纵坐标
            //          vx: 0, // 横轴速度，x += vx * dt
            //          vy: 0, // 纵轴速度，y += vy * dt
            //          ax: 0, // 横轴加速度，vx += ax
            //          ay: 0 // 纵轴加速度，vy += ay
            //      },
            //      {
            //          image: 'bg1', // 图片 id 或者路径
            //          repeat: '', // 是否重复，可选值: repeat, repeat-x, repeat-y ，默认 no-repeat
            //          x: 0, // 横坐标
            //          y: 0, // 纵坐标
            //          vx: 0, // 横轴速度，x += vx * dt
            //          vy: 0, // 纵轴速度，y += vy * dt
            //          ax: 0, // 横轴加速度，vx += ax
            //          ay: 0 // 纵轴加速度，vy += ay
            //      }
            // ]
            parallaxList: [],

            // 对应 mousedown 和 touchstart 事件
            // 这个 func 中的 this 指向的是当前的 DisplayObject 实例
            captureFunc: util.noop,
            // 对应 mousemove 和 touchmove 事件
            // 这个 func 中的 this 指向的是当前的 DisplayObject 实例
            moveFunc: util.noop,
            // 对应 mouseup 和 touchend 事件
            // 这个 func 中的 this 指向的是当前的 DisplayObject 实例
            releaseFunc: util.noop
        }, opts);

        // 当前场景中的所有可显示对象集合
        this.displayObjectList = [];

        // 当前场景中的所有可显示对象，对象，方便读取
        this.displayObjects = {};

        // 初始化 mouse 和 touch 事件
        initMouseEvent.call(this);

        return this;
    }

    Stage.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Stage,

        /**
         * 设置 captureFunc，对应 mousedown 和 touchstart 事件
         * 这个 func 中的 this 指向的是当前的 DisplayObject 实例
         *
         * @param {Function} func function
         *
         * @return {Object} DisplayObject 实例
         */
        setCaptureFunc: function (func) {
            this.captureFunc = func || util.noop;
            return this;
        },

        /**
         * 设置 moveFunc，对应 mousemove 和 touchmove 事件
         * 这个 func 中的 this 指向的是当前的 DisplayObject 实例
         *
         * @param {Function} func function
         *
         * @return {Object} DisplayObject 实例
         */
        setMoveFunc: function (func) {
            this.moveFunc = func || util.noop;
            return this;
        },

        /**
         * 设置 releaseFunc，对应 mouseup 和 touchend 事件
         * 这个 func 中的 this 指向的是当前的 DisplayObject 实例
         *
         * @param {Function} func function
         *
         * @return {Object} DisplayObject 实例
         */
        setReleaseFunc: function (func) {
            this.releaseFunc = func || util.noop;
            return this;
        },

        /**
         * 清除
         *
         * @return {Object} Stage 实例
         */
        clear: function () {
            this.offCtx.clearRect(0, 0, this.width, this.height);
            return this;
        },

        /**
         * 获取场景的 zIndex，场景的排序实际上就是变化 zIndex
         * 和 game.getStageIndex(stage) 的作用一样
         *
         * @return {number} zIndex
         */
        getIndex: function () {
            return this.zIndex;
        },

        /**
         * 设置场景的背景颜色，参数为空时即清除背景色
         *
         * @param {string} color 颜色值 #f00, rgba(255, 0, 0, 1), red
         *
         * @return {Object} Stage 实例
         */
        setBgColor: function (color) {
            this.bgColor = color;
            this.canvas.style.backgroundColor = this.bgColor || 'transparent';
            return this;
        },

        /**
         * 设置场景的背景图，不设置图片参数时即清除背景图
         *
         * @param {string | HTML.IMAGEElement} img 图片参数
         * @param {string} bgImgRepeatPattern center: 居中; full: 拉伸; 默认平铺
         *
         * @return {Object} Stage 实例
         */
        setBgImg: function (img, bgImgRepeatPattern) {
            var imgUrl;

            if (util.getType(img) === 'htmlimageelement') {
                imgUrl = img.src;
            }
            else if (util.getType(img) === 'string') {
                imgUrl = img;
            }

            var bgRepeat = '';
            var bgPos = '';
            var bgSize = '';

            switch (bgImgRepeatPattern) {
                // 居中
                case 'center':
                    bgRepeat = 'no-repeat';
                    bgPos = 'center';
                    break;
                // 拉伸
                case 'full':
                    bgSize = '100% 100%';
                    break;
            }

            if (imgUrl) {
                this.canvas.style.backgroundImage = 'url(' + imgUrl + ')';
                this.canvas.style.backgroundRepeat = bgRepeat;
                this.canvas.style.backgroundPosition = bgPos;
                this.canvas.style.backgroundSize = bgSize;
            }
            else {
                this.canvas.style.backgroundImage = '';
                this.canvas.style.backgroundRepeat = '';
                this.canvas.style.backgroundPosition = '';
                this.canvas.style.backgroundSize = '';
            }

            return this;
        },

        /**
         * 设置时差滚动
         *
         * @param {Array.<Object>} opts 配置项
         * @param {HTMLImageElement} opts[i].image 图片
         * @param {string} opts[i].repeat 是否重复，可选值: repeat, repeat-x, repeat-y ，默认 no-repeat
         * @param {number} opts[i].animInterval opts[i].anims 的循环间隔，
         *                                   这个间隔不是指的时间间隔，当 totalFrameCounter % opts[i].animInterval === 0 时触发
         * @param {Array} opts[i].anims 动画组，如果设置了次属性，那么会根据这个属性里面的值来切换动画
         *                           例如: opts[i].anims = [{aX: 1, aY: 1}, {aX: -1, aY: -1}]，那么首先会执行 opts[i].anims[0] 的变化，
         *                           在 totalFrameCounter % animInterval === 0 后，会执行 opts[i].anims[1] ，如此循环
         *                           如果 opts[i].animInterval 没有设置，则取默认值 10000
         *
         * @return {Object} Stage 实例
         */
        setParallax: function (parallaxList) {
            if (!Array.isArray(parallaxList)) {
                parallaxList = [parallaxList];
            }

            var asset = this.game.asset;
            console.warn(asset, 'asset');
            for (var i = 0, len = parallaxList.length; i < len; i++) {
                var parallax = parallaxList[i];
                console.warn(parallax, 3);
            }
            // opts = opts || {};

            // if (!opts.image) {
            //     throw new Error('Parallax must be require a image param');
            // }

            // opts.repeat = (opts.repeat && ['repeat', 'repeat-x', 'repeat-y'].indexOf(opts.repeat) !== -1)
            //     ? opts.repeat : 'no-repeat';

            // // 视差滚动的场景才会有这个属性
            // this.parallaxList = util.extend(
            //     {},
            //     {
            //         x: 0, // 横坐标
            //         y: 0, // 纵坐标
            //         vX: 0, // 横轴速度，x += vX
            //         vY: 0, // 纵轴速度，y += vY
            //         aX: 0, // 横轴加速度，vX += aX
            //         aY: 0 // 纵轴加速度，vY += aY
            //     },
            //     opts
            // );

            return this;
        },

        /**
         * 场景的更新，需要更新场景里面的所有精灵
         *
         * @param {number} totalFrameCounter 游戏的总帧数计数器
         * @param {number} dt delta
         */
        step: function (dt, requestID) {
            this.fire('beforeStageStep');
            this.fire('afterStageStep');
            // console.warn(dt, requestID);
            // if (dt < 0) {
            //     dt = 1.0 / 60;
            // }

            // if (dt > 1 / 15) {
            //     dt  = 1.0 / 15;
            // }

            // updateParallax.call(this, totalFrameCounter);

            // var displayObjectList = this.displayObjectList;
            // var len = displayObjectList.length;
            // var displayObjectStatus;
            // for (var i = 0; i < len; i++) {
            //     var curDisplay = displayObjectList[i];
            //     if (curDisplay) {
            //         displayObjectStatus = curDisplay.status;
            //         if (displayObjectStatus === STATUS.NORMAL || displayObjectStatus === STATUS.NOT_RENDER) {
            //             curDisplay._update(dt);
            //             curDisplay.update(dt);
            //         }
            //     }
            // }
        },

        /**
         * 场景的渲染，需要渲染场景里面的所有精灵
         * 在 render 的时候销毁 status = STATUS.DESTROYED 的 displayObject
         */
        render: function () {
            this.fire('beforeStageRender');

            this.clear();

            this.offCtx.save();
            this.offCtx.clearRect(0, 0, this.offCanvas.width, this.offCanvas.height);

            // renderParallax.call(this);
            // this.sortDisplayObject();
            // var displayObjectList = this.displayObjectList;
            // var len = displayObjectList.length;
            // var displayObjectStatus;

            // for (var i = 0; i < len; i++) {
            //     var curDisplay = displayObjectList[i];
            //     if (curDisplay) {
            //         displayObjectStatus = curDisplay.status;
            //         if (displayObjectStatus === STATUS.DESTROYED) {
            //             this.removeDisplayObject(curDisplay);
            //         }
            //         else if (displayObjectStatus === STATUS.NORMAL || displayObjectStatus === STATUS.NOT_UPDATE) {
            //             curDisplay.render(this.offCtx);
            //         }
            //     }
            // }

            // this.offCtx.restore();
            // this.ctx.drawImage(this.offCanvas, 0, 0);

            this.fire('afterStageRender');
        },

    }

    /**
     * 初始化 mouse 和 touch 事件
     *
     * @return {Object} Stage 实例
     */
    function initMouseEvent() {
        bindMouseEvent.call(this);
        domEvt.initMouse(this);
        return this;
    }

    /**
     * 绑定 mouse 和 touch 事件
     *
     * @return {Object} Stage 实例
     */
    function bindMouseEvent() {
        var me = this;
        domEvt.events.forEach(function (name, i) {
            var invokeMethod = domEvt.fireEvt[name];
            if (invokeMethod) {
                me.on(name, invokeMethod);
            }
        });
        return me;
    }

    util.inherits(Stage, Event);

    return Stage;

});
