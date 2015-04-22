/**
 * @file 场景类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var Event = require('./Event');
    var util = require('./util');
    var DisplayObject = require('./DisplayObject');
    var domEvt = require('./domEvt');
    var ig = require('./ig');

    var STATUS = ig.STATUS;

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
            width: opts.gameOwner.width,
            // 场景的高度，实际上是游戏的高度即 canvas.height
            height: opts.gameOwner.height,
            // 场景的 cssWidth
            cssWidth: opts.gameOwner.cssWidth,
            // 场景的 cssHeight
            cssHeight: opts.gameOwner.cssHeight
        }, opts);

        // 当前场景中的所有可显示对象集合
        this.displayObjectList = [];

        // 当前场景中的所有可显示对象，对象，方便读取
        this.displayObjects = {};

        // 初始化 mouse 和 touch 事件
        initMouseEvent.call(this);
        // debugger
        // Event.call(this, this.p);

        return this;
    }

    Stage.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Stage,

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
         * 设置背景， repeatPattern: center 居中；full 拉伸；默认平铺
         *
         * @param {string | HTML.IMAGEElement} img 图片参数
         * @param {string} repeatPattern center: 居中; full: 拉伸; 默认平铺
         *
         * @return {Object} Stage 实例
         */
        setBgImg: function (img, repeatPattern) {

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

            switch (repeatPattern) {
                // 居中
                case 'center':
                    bgRepeat = 'no-repeat';
                    bgPos = 'center';
                    break;
                // 拉伸
                case 'full':
                    bgSize = this.cssWidth + 'px ' + this.cssHeight + 'px';
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
         * 设置视差滚动
         *
         * @param {Object} opts 配置项
         * @param {HTMLImageElement} opts.image 图片
         * @param {string} opts.repeat 是否重复，可选值: repeat, repeat-x, repeat-y ，默认 no-repeat
         * @param {number} opts.animInterval opts.anims 的循环间隔，
         *                                   这个间隔不是指的时间间隔，当 totalFrameCounter % opts.animInterval === 0 时触发
         * @param {Array} opts.anims 动画组，如果设置了次属性，那么会根据这个属性里面的值来切换动画
         *                           例如: opts.anims = [{aX: 1, aY: 1}, {aX: -1, aY: -1}]，那么首先会执行 opts.anims[0] 的变化，
         *                           在 totalFrameCounter % animInterval === 0 后，会执行 opts.anims[1] ，如此循环
         *                           如果 opts.animInterval 没有设置，则取默认值 10000
         *
         * @return {Object} Stage 实例
         */
        setParallax: function (opts) {
            opts = opts || {};

            if (!opts.image) {
                throw new Error('Parallax must be require a image param');
            }

            opts.repeat = (opts.repeat && ['repeat', 'repeat-x', 'repeat-y'].indexOf(opts.repeat) !== -1)
                ? opts.repeat : 'no-repeat';

            // 视差滚动的场景才会有这个属性
            this.parallax = util.extend(
                {},
                {
                    x: 0, // 横坐标
                    y: 0, // 纵坐标
                    vX: 0, // 横轴速度，x += vX
                    vY: 0, // 纵轴速度，y += vY
                    aX: 0, // 横轴加速度，vX += aX
                    aY: 0 // 纵轴加速度，vY += aY
                },
                opts
            );

            return this;
        },

        /**
         * 场景的更新，需要更新场景里面的所有精灵
         *
         * @param {number} totalFrameCounter 游戏的总帧数计数器
         * @param {number} dt delta
         */
        update: function (totalFrameCounter, dt) {
            if (dt < 0) {
                dt = 1.0 / 60;
            }

            if (dt > 1 / 15) {
                dt  = 1.0 / 15;
            }

            updateParallax.call(this, totalFrameCounter);

            var displayObjectList = this.displayObjectList;
            var len = displayObjectList.length;
            var displayObjectStatus;
            for (var i = 0; i < len; i++) {
                var curDisplay = displayObjectList[i];
                if (curDisplay) {
                    displayObjectStatus = curDisplay.status;
                    if (displayObjectStatus === STATUS.NORMAL || displayObjectStatus === STATUS.NOT_RENDER) {
                        curDisplay.update(dt);
                    }
                }
            }
        },

        /**
         * 场景的渲染，需要渲染场景里面的所有精灵
         * 在 render 的时候销毁 status = STATUS.DESTROYED 的 displayObject
         */
        render: function () {
            this.clear();

            this.fire('beforeStageRender');

            this.offCtx.save();
            this.offCtx.clearRect(0, 0, this.offCanvas.width, this.offCanvas.height);

            renderParallax.call(this);
            this.sortDisplayObject();
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
                    else if (displayObjectStatus === STATUS.NORMAL || displayObjectStatus === STATUS.NOT_UPDATE) {
                        curDisplay.render(this.offCtx);
                    }
                }
            }

            this.offCtx.restore();
            this.ctx.drawImage(this.offCanvas, 0, 0);

            this.fire('afterStageRender');
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
         * 获取当前场景里面的所有 displayObject
         *
         * @return {Array} 所有 displayObject 集合
         */
        getDisplayObjectList: function () {
            return this.displayObjectList;
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
         * 创建一个 displayObject
         *
         * @param {Object} displayObjOpts 创建 displayObject 所需的参数
         *
         * @return {Object} 创建的 displayObject 对象
         */
        createDisplayObject: function (displayObjOpts) {
            var displayObj = new DisplayObject(displayObjOpts);
            this.addDisplayObject(displayObj);
            return displayObj;
        },

        /**
         * 向场景中添加一个 DisplayObject 实例
         *
         * @param {Object} displayObj DisplayObject 实例
         *
         * @return {Object} Stage 实例
         */
        addDisplayObject: function (displayObj) {
            if (displayObj && !this.getDisplayObjectByName(displayObj.name)) {
                displayObj.stageOwner = displayObj.stageOwner = this;
                this.displayObjectList.push(displayObj);
                this.displayObjects[displayObj.name] = displayObj;
            }
            return this;
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

    /**
      * 更新视差滚动
      *
      * @param {number} totalFrameCounter 游戏的总帧数记录器
      */
    function updateParallax(totalFrameCounter) {
        var parallax = this.parallax;
        if (parallax) {

            if (parallax.anims && util.getType(parallax.anims) === 'array') {
                parallax.animInterval = parallax.animInterval || 10000;
                if (!parallax.curAnim) {
                    parallax.curAnim = parallax.anims[0];
                }

                if (totalFrameCounter % parallax.animInterval === 0) {
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
                    aX: parallax.aX,
                    aY: parallax.aY
                };
            }

            parallax.vX = (parallax.vX + parallax.curAnim.aX) % parallax.image.width;
            parallax.vY = (parallax.vY + parallax.curAnim.aY) % parallax.image.height;
        }
    }

    /**
     * 渲染视差滚动
     */
    function renderParallax() {
        var parallax = this.parallax;
        if (parallax) {
            var offCtx = this.offCtx;
            if (parallax.repeat !== 'no-repeat') {
                renderParallaxRepeatImage.call(parallax, offCtx);
            }

            var imageWidth = parallax.image.width;
            var imageHeight = parallax.image.height;

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
                        newScrollPos.x = parallax.vX;
                    }

                    if (y === 0) {
                        newScrollPos.y = parallax.vY;
                    }
                    drawArea = renderParallaxScroll.call(
                        parallax, offCtx, newPos, newArea, newScrollPos, imageWidth, imageHeight
                    );
                }
            }
        }
    }

    /**
     * 绘制 repeat, repeat-x, repeat-y
     *
     * @param {Object} offCtx 离屏 canvas 2d context 对象
     */
    function renderParallaxRepeatImage(offCtx) {
        offCtx.save();
        offCtx.fillStyle = offCtx.createPattern(this.image, this.repeat);
        offCtx.fillRect(this.x, this.y, offCtx.canvas.width, offCtx.canvas.height);
        offCtx.restore();

        if (!newImage4ParallaxRepeat.src) {
            newImage4ParallaxRepeat.src = offCtx.canvas.toDataURL();
            this.image = newImage4ParallaxRepeat;
        }
    }

     /**
     * 绘制视差滚动滚动的区域
     *
     * @param {Object} offCtx 离屏 canvas 2d context 对象
     * @param {Object} newPos 新的绘制的起点坐标对象
     * @param {Object} newArea 新绘制区域的大小对象
     * @param {Object} newScrollPos 滚动的区域起点的坐标对象
     * @param {number} imageWidth 图片宽度
     * @param {number} imageHeight 图片高度
     *
     * @return {Object} 待绘制区域的宽高
     */
    function renderParallaxScroll(offCtx, newPos, newArea, newScrollPos, imageWidth, imageHeight) {
        var xOffset = Math.abs(newScrollPos.x) % imageWidth;
        var yOffset = Math.abs(newScrollPos.y) % imageHeight;
        var left = newScrollPos.x < 0 ? imageWidth - xOffset : xOffset;
        var top = newScrollPos.y < 0 ? imageHeight - yOffset : yOffset;
        var width = newArea.width < imageWidth - left ? newArea.width : imageWidth - left;
        var height = newArea.height < imageHeight - top ? newArea.height : imageHeight - top;

        offCtx.drawImage(this.image, left, top, width, height, newPos.x, newPos.y, width, height);

        return {
            width: width,
            height: height
        };
    }

    util.inherits(Stage, Event);

    return Stage;
});
