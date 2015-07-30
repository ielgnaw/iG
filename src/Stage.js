/**
 * @file 场景类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var ig = require('./ig');
    var Event = require('./Event');
    var util = require('./util');
    var domEvt = require('./domEvt');

    var CONFIG = ig.getConfig();

    var STATUS = CONFIG.status;

    /**
     * 作为 repeat 时的新图片
     *
     * @type {Image}
     */
    var newImage4ParallaxRepeat = new Image();

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
            // // 离屏 canvas
            // offCanvas: opts.offCanvas,
            // // 离屏 canvas context
            // offCtx: opts.offCanvas.getContext('2d'),
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
            // 视差滚动的配置，默认空数组，一个合法的配置如下：
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
            parallaxOpts: [],
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

        // 当前场景的视差滚动的存储
        this.parallaxList = [];

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
            // this.offCtx.clearRect(0, 0, this.width, this.height);
            this.ctx.clearRect(0, 0, this.width, this.height);
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

            this.canvas.style.backgroundRepeat = bgRepeat;
            this.canvas.style.backgroundPosition = bgPos;
            this.canvas.style.backgroundSize = bgSize;

            if (util.getType(img) === 'htmlimageelement') {
                this.canvas.style.backgroundImage = 'url(' + img.src + ')';
            }
            else if (util.getType(img) === 'string') {
                var asset = this.game.asset;
                var resource = this.game.resource;
                var bgImg = util.getImgAsset(img, asset, resource);
                if (bgImg) {
                    this.canvas.style.backgroundImage = 'url(' + bgImg.src + ')';
                }
                else {
                    this.canvas.style.backgroundImage = '';
                    this.canvas.style.backgroundRepeat = '';
                    this.canvas.style.backgroundPosition = '';
                    this.canvas.style.backgroundSize = '';
                }
            }

            return this;
        },

        /**
         * 设置时差滚动
         *
         * @param {Array.<Object>} parallaxOpts 配置项
         * @property {HTMLImageElement} parallaxOpts[i].image 图片
         * @property {string} parallaxOpts[i].repeat 是否重复，可选值: repeat, repeat-x, repeat-y ，默认 no-repeat
         * @property {number} parallaxOpts[i].animInterval parallaxOpts[i].anims 的循环间隔，
         *                                              这个间隔不是指的时间间隔，
         *                                              当 totalFrameCounter % parallaxOpts[i].animInterval === 0 时触发
         * @property {Array} parallaxOpts[i].anims 动画组，如果设置了次属性，那么会根据这个属性里面的值来切换动画
         *                           例如: parallaxOpts[i].anims = [{aX: 1, aY: 1}, {aX: -1, aY: -1}]，
         *                           那么首先会执行 parallaxOpts[i].anims[0] 的变化，
         *                           在 totalFrameCounter % animInterval === 0 后，会执行 parallaxOpts[i].anims[1] ，
         *                           如此循环，如果 parallaxOpts[i].animInterval 没有设置，则取默认值 10000
         *
         * @return {Object} Stage 实例
         */
        setParallax: function (parallaxOpts) {
            parallaxOpts = parallaxOpts || [];

            if (!Array.isArray(parallaxOpts)) {
                parallaxOpts = [parallaxOpts];
            }

            var asset = this.game.asset;
            var resource = this.game.resource;

            for (var i = 0, len = parallaxOpts.length; i < len; i++) {
                var parallaxOpt = parallaxOpts[i];

                var imageAsset = util.getImgAsset(parallaxOpt.image, asset, resource);
                if (!imageAsset) {
                    throw new Error('Parallax must be require a image param');
                }

                parallaxOpt.repeat
                    = (parallaxOpt.repeat && ['repeat', 'repeat-x', 'repeat-y'].indexOf(parallaxOpt.repeat) !== -1)
                        ? parallaxOpt.repeat
                        : 'no-repeat';

                this.parallaxList.push(
                    util.extend(
                        true,
                        {
                            imageAsset: imageAsset
                        },
                        {
                            x: 0, // 横坐标
                            y: 0, // 纵坐标
                            vx: 0, // 横轴速度，x += vx
                            vy: 0, // 纵轴速度，y += vy
                            ax: 0, // 横轴加速度，vx += ax
                            ay: 0 // 纵轴加速度，vy += ay
                        },
                        parallaxOpt
                    )
                );
            }

            return this;
        },

        /**
         * 场景的更新，需要更新场景里面的所有精灵
         *
         * @param {number} dt 毫秒，固定的时间片
         * @param {number} stepCount 每帧中切分出来的每个时间片里执行的函数的计数器
         * @param {number} requestID requestAnimationFrame 标识
         */
        step: function (dt, stepCount, requestID) {
            this.fire('beforeStageStep');
            updateParallax.call(this, dt, stepCount, requestID);
            updateSprite.call(this, dt, stepCount, requestID);
            this.fire('afterStageStep');
        },

        /**
         * 场景的渲染，需要渲染场景里面的所有精灵
         * 在 render 的时候销毁 status = STATUS.DESTROYED 的 displayObject
         *
         * @param {number} execCount 每帧执行的函数的计数器
         */
        render: function (execCount) {
            this.fire('beforeStageRender');

            this.clear();

            this.ctx.save();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            renderParallax.call(this);
            renderSprite.call(this, execCount);

            this.ctx.restore();

            // this.ctx.drawImage(this.canvas, 0, 0);

            this.fire('afterStageRender');
        },

        /**
         * 创建一个 displayObject
         *
         * @param {Object} displayObjOpts 创建 displayObject 所需的参数
         *
         * @return {Object} 创建的 displayObject 对象
         */
        // createDisplayObject: function (displayObjOpts) {
        //     var displayObj = new DisplayObject(displayObjOpts);
        //     this.addDisplayObject(displayObj);
        //     return displayObj;
        // },

        /**
         * 向场景中添加一个新创建 DisplayObject 实例
         *
         * @param {Object} displayObj DisplayObject 实例
         *
         * @return {Object} 创建的 displayObject 对象
         */
        addDisplayObject: function (displayObj) {
            if (displayObj && !this.getDisplayObjectByName(displayObj.name)) {
                displayObj.stage = this;
                displayObj.game = this.game;
                this.displayObjectList.push(displayObj);
                this.displayObjects[displayObj.name] = displayObj;

                _childrenHandler.call(this, displayObj);
            }
            return displayObj;
        },

        /**
         * 根据名字获取 displayObject 对象
         *
         * @param {string} name displayObject 名字
         *
         * @return {Object} displayObject 对象
         */
        getDisplayObjectByName: function (name) {
            return this.displayObjects[name];
        },

        /**
         * 获取当前场景里面的所有 displayObject
         *
         * @return {Array} 所有 displayObject 集合
         */
        getDisplayObjectList: function () {
            return this.displayObjectList;
        },

        /**
         * 排序场景中的 displayObject
         */
        sortDisplayObject: function () {
            this.displayObjectList.sort(function (o1, o2) {
                return o1.zIndex - o2.zIndex;
            });
        },

        /**
         * 移除 displayObject
         *
         * @param {Object} displayObj displayObject 对象
         *
         * @return {Object} Stage 实例
         */
        removeDisplayObject: function (displayObj) {
            displayObj && this.removeDisplayObjectByName(displayObj.name);
            return this;
        },

        /**
         * 根据 name 移除 displayObject
         *
         * @param {string} name displayObject 的名字
         *
         * @return {Object} Stage 实例
         */
        removeDisplayObjectByName: function (name) {
            var candidateObj = this.displayObjects[name];
            if (candidateObj) {
                delete this.displayObjects[candidateObj.name];
                var displayObjectList = this.displayObjectList;
                util.removeArrByCondition(displayObjectList, function (o) {
                    return o.name === name;
                });
            }
            return this;
        },

        /**
         * 清除所有 displayObject
         */
        clearAllDisplayObject: function () {
            this.displayObjectList = [];
            this.displayObjects = {};
        },

        /**
         * 销毁
         */
        destroy: function () {
            this.clearAllDisplayObject();
            this.clearEvents();
        }
    };

    /**
     * 更新当前场景里面的精灵
     *
     * @param {number} dt 毫秒，固定的时间片
     * @param {number} stepCount 每帧中切分出来的每个时间片里执行的函数的计数器
     * @param {number} requestID requestAnimationFrame 标识
     */
    function updateSprite(dt, stepCount, requestID) {
        var displayObjectList = this.displayObjectList;
        var len = displayObjectList.length;
        var displayObjectStatus;
        for (var i = 0; i < len; i++) {
            var curDisplay = displayObjectList[i];
            if (curDisplay) {
                displayObjectStatus = curDisplay.status;
                if (displayObjectStatus === STATUS.DESTROYED) {
                    this.removeDisplayObject(curDisplay);
                }
                if (displayObjectStatus === STATUS.NORMAL
                    || displayObjectStatus === STATUS.NOT_RENDER
                ) {
                    curDisplay._step(dt, stepCount, requestID);
                    curDisplay.step(dt, stepCount, requestID);
                }
            }
        }
    }

    /**
     * 子精灵的处理
     *
     * @param {Object} displayObj displayObject 对象
     */
    /* eslint-disable fecs-camelcase */
    function _childrenHandler(displayObj) {
        var children = displayObj.children;
        if (!Array.isArray(children)) {
            return;
        }

        var stage = this;
        var len = children.length;
        var i = 0;
        var child;
        if (!displayObj._.isHandleChildren) {
            displayObj._.isHandleChildren = true;

            // 实例化 children 的时候，children 的 x, y 是相对于 parent 的 x, y 的
            for (i = 0; i < len; i++) {
                child = children[i];
                child.setRelativeXY(child.x, child.y);
                // child.relativeX = child.x;
                // child.relativeY = child.y;
                child.x += displayObj.x;
                child.y += displayObj.y;
                child.move(child.x, child.y);
                child.parent = displayObj;
                child.setMatrix(displayObj.matrix.m);
                stage.addDisplayObject(child);
            }
        }
        else {
            // 实例化 children 的时候，children 的 x, y 是相对于 parent 的 x, y 的
            for (i = 0; i < len; i++) {
                child = children[i];
                stage.addDisplayObject(child);
            }
        }
    }
    /* eslint-enable fecs-camelcase */

    /**
     * 渲染场景里面的精灵
     *
     * @param {number} execCount 每帧执行的函数的计数器
     */
    function renderSprite(execCount) {
        this.sortDisplayObject();
        var displayObjectList = this.displayObjectList;
        var len = displayObjectList.length;
        var displayObjectStatus;

        for (var i = 0; i < len; i++) {
            var curDisplay = displayObjectList[i];
            if (curDisplay) {
                displayObjectStatus = curDisplay.status;
                if (displayObjectStatus === STATUS.NORMAL
                    || displayObjectStatus === STATUS.NOT_UPDATE
                ) {
                    curDisplay.render(this.ctx, execCount);
                }
            }
        }
    }

    /**
      * 更新视差滚动
      *
      * @param {number} dt 毫秒，固定的时间片
      * @param {number} stepCount 每帧中切分出来的每个时间片里执行的函数的计数器
      * @param {number} requestID requestAnimationFrame 标识
      */
    function updateParallax(dt, stepCount, requestID) {
        var parallaxList = this.parallaxList;
        var len = parallaxList.length;
        if (!parallaxList || !len) {
            return;
        }

        for (var i = 0; i < len; i++) {
            var parallax = parallaxList[i];
            if (parallax.anims && util.getType(parallax.anims) === 'array') {
                parallax.animInterval = parallax.animInterval || 10000;
                if (!parallax.curAnim) {
                    parallax.curAnim = parallax.anims[0];
                }

                if (stepCount % parallax.animInterval === 0) {
                    if (parallax.time === void 0) {
                        parallax.time = 0;
                    }

                    parallax.time++;

                    if (parallax.time === parallax.anims.length) {
                        parallax.time = 0;
                    }

                    parallax.curAnim = parallax.anims[parallax.time];
                }
            }
            else {
                parallax.curAnim = {
                    ax: parallax.ax * dt,
                    ay: parallax.ay * dt
                };
            }

            parallax.vx = (parallax.vx * dt + parallax.curAnim.ax) % parallax.imageAsset.width;
            parallax.vy = (parallax.vy * dt + parallax.curAnim.ay) % parallax.imageAsset.height;
        }
    }

    /**
     * 渲染视差滚动
     */
    function renderParallax() {
        var parallaxList = this.parallaxList;
        var len = parallaxList.length;
        if (!parallaxList || !len) {
            return;
        }

        var ctx = this.ctx;

        for (var i = 0; i < len; i++) {
            var parallax = parallaxList[i];
            if (parallax.repeat !== 'no-repeat') {
                renderParallaxRepeatImage.call(parallax, ctx);
            }
            // console.warn(this.game.yRatio);
            var imageWidth = parallax.imageAsset.width;
            var imageHeight = parallax.imageAsset.height;
            var drawArea = {
                width: 0,
                height: 0
            };
            for (var y = 0; y < imageHeight; y += drawArea.height) {
                for (var x = 0; x < imageWidth; x += drawArea.width) {
                    // 从左上角开始画下一个块
                    var newPos = {
                        x: parallax.x + x,
                        y: parallax.y + y
                    };

                    // 剩余的绘制空间
                    var newArea = {
                        width: imageWidth - x,
                        height: imageHeight - y
                    };

                    var newScrollPos = {
                        x: 0,
                        y: 0
                    };

                    if (x === 0) {
                        newScrollPos.x = parallax.vx;
                    }

                    if (y === 0) {
                        newScrollPos.y = parallax.vy;
                    }
                    drawArea = renderParallaxScroll.call(
                        parallax, ctx, newPos, newArea, newScrollPos, imageWidth, imageHeight
                    );
                    // console.warn(drawArea);
                }
            }
        }
    }

    /**
     * 绘制视差滚动滚动的区域
     *
     * @param {Object} ctx canvas 2d context 对象
     * @param {Object} newPos 新的绘制的起点坐标对象
     * @param {Object} newArea 新绘制区域的大小对象
     * @param {Object} newScrollPos 滚动的区域起点的坐标对象
     * @param {number} imageWidth 图片宽度
     * @param {number} imageHeight 图片高度
     *
     * @return {Object} 待绘制区域的宽高
     */
    function renderParallaxScroll(ctx, newPos, newArea, newScrollPos, imageWidth, imageHeight) {
        var xOffset = Math.abs(newScrollPos.x) % imageWidth;
        var yOffset = Math.abs(newScrollPos.y) % imageHeight;
        var left = newScrollPos.x < 0 ? imageWidth - xOffset : xOffset;
        var top = newScrollPos.y < 0 ? imageHeight - yOffset : yOffset;
        var width = newArea.width < imageWidth - left ? newArea.width : imageWidth - left;
        var height = newArea.height < imageHeight - top ? newArea.height : imageHeight - top;

        ctx.drawImage(this.imageAsset, left, top, width, height, newPos.x, newPos.y, width, height);

        return {
            width: width,
            height: height
        };
    }

    /**
     * 绘制 repeat, repeat-x, repeat-y
     *
     * @param {Object} ctx canvas 2d context 对象
     */
    function renderParallaxRepeatImage(ctx) {
        ctx.save();
        ctx.fillStyle = ctx.createPattern(this.imageAsset, this.repeat);
        ctx.fillRect(this.x, this.y, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();

        if (!newImage4ParallaxRepeat.src) {
            newImage4ParallaxRepeat.src = ctx.canvas.toDataURL();
            this.imageAsset = newImage4ParallaxRepeat;
        }
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
