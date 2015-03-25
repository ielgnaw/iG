/**
 * @file 场景类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var ig = require('./ig');
    var Event = require('./Event');
    var util = require('./util');
    var env = require('./env');
    var DisplayObject = require('./DisplayObject');

    /**
     * 作为 repeat 时的新图片
     *
     * @type {Image}
     */
    var newImage4ParallaxRepeat = new Image();

    var guid = 0;

    /**
     * 绘制 repeat, repeat-x, repeat-y
     *
     * @param {Object} offCtx 离屏 canvas 2d context 对象
     */
    function renderParallaxRepeatImage(offCtx) {
        var me = this;
        offCtx.save();
        offCtx.fillStyle = offCtx.createPattern(me.image, me.repeat);
        offCtx.fillRect(me.x, me.y, offCtx.canvas.width, offCtx.canvas.height);
        offCtx.restore();

        if (!newImage4ParallaxRepeat.src) {
            newImage4ParallaxRepeat.src = offCtx.canvas.toDataURL();
            me.image = newImage4ParallaxRepeat;
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
        var me = this;

        var xOffset = Math.abs(newScrollPos.x) % imageWidth;
        var yOffset = Math.abs(newScrollPos.y) % imageHeight;
        var left = newScrollPos.x < 0 ? imageWidth - xOffset : xOffset;
        var top = newScrollPos.y < 0 ? imageHeight - yOffset : yOffset;
        var width = newArea.width < imageWidth - left ? newArea.width : imageWidth - left;
        var height = newArea.height < imageHeight - top ? newArea.height : imageHeight - top;

        offCtx.drawImage(me.image, left, top, width, height, newPos.x, newPos.y, width, height);

        return {
            width: width,
            height: height
        };
    }

    /**
     * 渲染视差滚动
     */
    function renderParallax() {
        var me = this;
        var parallax = me.parallax;
        if (parallax) {
            var offCtx = me.offCtx;
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
                    drawArea = renderParallaxScroll.call(parallax, offCtx, newPos, newArea, newScrollPos, imageWidth, imageHeight);
                }
            }
        }
    }

    /**
     * 更新视差滚动
     */
    function updateParallax() {
        var me = this;
        var parallax = me.parallax;
        if (parallax) {
            parallax.vX = (parallax.vX + parallax.aX) % parallax.image.width;
            parallax.vY = (parallax.vY + parallax.aY) % parallax.image.height;
        }
    }

    /**
     * 场景类构造函数
     * 可以把场景想象成 canvas 以及 canvas 的容器
     *
     * @constructor
     *
     * @param {Object} opts 参数
     */
    function Stage(opts) {
        Event.apply(this, arguments);

        opts = opts || {};

        this.name = (opts.name === null || opts.name === undefined) ? 'ig_stage_' + (guid++) : opts.name;

        // 当前场景中的所有可显示对象集合
        this.displayObjectList = [];

        // 当前场景中的所有可显示对象，对象，方便读取
        this.displayObjects = {};

        this.canvas = opts.canvas;
        this.ctx = opts.canvas.getContext('2d');
        this.offCanvas = opts.offCanvas;
        this.offCtx = opts.offCanvas.getContext('2d');

        // console.warn(this.canvas);
        // captureTouch.call(this, this.canvas);

    }

    Stage.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Stage,

        // /**
        //  * 设置 canvas 以及 canvas.container 的宽高
        //  *
        //  * @param {number} width 宽度
        //  * @param {number} height 高度
        //  */
        // setSize: function (width, height) {
        //     var me = this;

        //     // width = width || defaultCanvasWidth;
        //     // height = height || defaultCanvasHeight;

        //     // resetStage(me.canvas, width, height);

        //     // me.width = me.canvas.width;
        //     // me.height = me.canvas.height;

        //     // me.offCanvas.width = me.canvas.width;
        //     // me.offCanvas.style.width = me.canvas.style.width;
        //     // me.offCanvas.height = me.canvas.height;
        //     // me.offCanvas.style.height = me.canvas.style.height;

        //     initStage(this.canvas);

        //     this.offCanvas.width = this.canvas.width;
        //     this.offCanvas.style.width = this.canvas.style.width;
        //     this.offCanvas.height = this.canvas.height;
        //     this.offCanvas.style.height = this.canvas.style.height;
        //     this.container = this.canvas.parentNode;

        //     this.width = this.canvas.width;
        //     // this.canvas.width = this.width;
        //     // this.offCanvas.width = this.width;

        //     this.height = this.canvas.height;

        // },

        /**
         * 设置 canvas 以及 canvas.container 的宽高
         *
         * @param {number} width 宽度
         * @param {number} height 高度
         */
        // setSize: function (width, height) {
        //     var me = this;
        //     me.width = width || me.width;
        //     me.height = height || me.height;

        //     // me.container.style.width = me.width + 'px';
        //     // me.container.style.height = me.height + 'px';

        //     me.canvas.width = me.width;
        //     me.canvas.height = me.height;

        //     // me.offCanvas.width = me.width;
        //     // me.offCanvas.height = me.height;

        // },

        /**
         * 清除
         *
         * @return {Object} Stage 实例
         */
        clear: function () {
            var me = this;
            me.ctx.clearRect(0, 0, me.width, me.height);
            return me;
        },

        /**
         * 清除场景
         *
         * @return {Object} Stage 实例
         */
        clean: function () {
            var me = this;
            me.container.removeChild(me.canvas);
            me.container.parentNode.removeChild(me.container);
            me.container = null;
            me.canvas = me.ctx = null;
            me.offCanvas = me.offCtx = null;
            return me;
        },

        /**
         * 设置场景的背景颜色
         *
         * @param {string} color 颜色值 #f00, rgba(255, 0, 0, 1), red
         *
         * @return {Object} Stage 实例
         */
        setBgColor: function (color) {
            var me = this;
            color = color || '#fff';
            me.canvas.style.backgroundColor = color;
            return me;
        },

        /**
         * 设置场景的背景图
         * 设置背景， repeatPattern: center 居中；full 拉伸；默认平铺
         *
         * @param {string} imgUrl 图片 url
         * @param {string} repeatPattern center: 居中; full: 拉伸; 默认平铺
         *
         * @return {Object} Stage 实例
         */
        setBgImg: function (img, repeatPattern) {
            var me = this;

            var imgUrl;

            if (util.getType(img) === 'htmlimageelement') {
                imgUrl = img.src;
            }
            else if (util.getType(img) === 'string') {
                imgUrl = img;
            }

            me.canvas.style.backgroundImage = 'url(' + imgUrl + ')';
            switch (repeatPattern) {
                // 居中
                case 'center':
                    me.canvas.style.backgroundRepeat = 'no-repeat';
                    me.canvas.style.backgroundPosition = 'center';
                    break;
                // 拉伸
                case 'full':
                    me.canvas.style.backgroundSize = me.cssWidth + 'px ' + me.cssHeight + 'px';
                    break;
            }
            return me;
        },

        /**
         * 设置视差滚动
         *
         * @param {Object} opts 配置项
         * @param {HTMLImageElement} opts.image 图片
         * @param {string} opts.repeat 是否重复，可选值: repeat, repeat-x, repeat-y ，默认 no-repeat
         */
        setParallaxScroll: function (opts) {
            var me = this;
            opts = opts || {};

            if (!opts.image) {
                throw new Error('ParallaxScroll must be require a image param');
            }

            opts.repeat = (opts.repeat && ['repeat', 'repeat-x', 'repeat-y'].indexOf(opts.repeat) !== -1)
                ? opts.repeat : 'no-repeat';

            // 视差滚动的场景才会有这个属性
            me.parallax = util.extend(
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

            console.warn(me);
        },

        /**
         * 场景的更新，需要更新场景里面的所有精灵
         */
        update: function () {
            var me = this;
            // console.warn(1);
            updateParallax.call(me);

            var displayObjectList = me.displayObjectList;
            var len = displayObjectList.length;
            var displayObjectStatus;
            for (var i = 0; i < len; i++) {
                displayObjectStatus = me.displayObjectList[i].status;
                if (displayObjectStatus === 1 || displayObjectStatus === 2) {
                    this.displayObjectList[i].update();
                }
            }
        },

        /**
         * 场景的渲染，需要渲染场景里面的所有精灵
         */
        render: function () {
            var me = this;
            me.clear();

            me.fire('beforeStageRender');

            this.sortDisplayObject();
            // this.renderDisplayObject();
            var displayObjectList = me.displayObjectList;
            var len = displayObjectList.length;
            var displayObjectStatus;

            me.offCtx.save();
            me.offCtx.clearRect(0, 0, me.offCanvas.width, me.offCanvas.height);

            renderParallax.call(me);
            for (var i = 0; i < len; i++) {
                displayObjectStatus = me.displayObjectList[i].status;
                if (displayObjectStatus === 1 || displayObjectStatus === 3) {
                    me.displayObjectList[i].render(me.offCtx);
                }
            }

            me.offCtx.restore();
            me.ctx.drawImage(me.offCanvas, 0, 0);

            me.fire('afterStageRender');
        },

        /**
         * 渲染场景中的 displayObject
         */
        renderDisplayObject: function () {
            var me = this;
            var displayObjectList = me.displayObjectList;
            var len = displayObjectList.length;
            var displayObjectStatus;

            me.offCtx.save();
            me.offCtx.clearRect(0, 0, me.offCanvas.width, me.offCanvas.height);
            for (var i = 0; i < len; i++) {
                displayObjectStatus = me.displayObjectList[i].status;
                if (displayObjectStatus === 1 || displayObjectStatus === 3) {
                    me.displayObjectList[i].render(me.offCtx);
                }
            }
            me.offCtx.restore();
            me.ctx.drawImage(me.offCanvas, 0, 0);
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
         */
        addDisplayObject: function (displayObj) {
            var me = this;
            if (displayObj && !me.getDisplayObjectByName(displayObj.name)) {
                displayObj.stageOwner = me;
                me.displayObjectList.push(displayObj);
                me.displayObjects[displayObj.name] = displayObj;
            }
        },

        /**
         * 移除 displayObject
         *
         * @param {Object} displayObj displayObject 对象
         */
        removeDisplayObject: function (displayObj) {
            displayObj && this.removeDisplayObjectByName(displayObj.name);
        },

        /**
         * 根据 name 移除 displayObject
         *
         * @param {string} name displayObject 的名字
         */
        removeDisplayObjectByName: function (name) {
            var me = this;
            var candidateObj = me.displayObjects[name];
            if (candidateObj) {
                delete me.displayObjects[candidateObj.name];
                var displayObjectList = me.displayObjectList;
                util.removeArrByCondition(displayObjectList, function (o) {
                    return o.name === name;
                });
            }
        },

        /**
         * 清除所有 displayObject
         */
        clearAllDisplayObject: function () {
            this.displayObjectList = [];
            this.displayObjects = {};
        }
    };

    util.inherits(Stage, Event);

    return Stage;

});
