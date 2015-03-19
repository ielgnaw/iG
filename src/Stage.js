/**
 * @file 场景类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var Event = require('./Event');
    var util = require('./util');
    var env = require('./env');
    var DisplayObject = require('./DisplayObject');

    var guid = 0;

    var defaultCanvasWidth = 383;
    var defaultCanvasHeight = 550;

    /**
     * 屏幕适配
     *
     * @param {HTML.Element} canvas canvas 节点
     * @param {HTML.Element} canvasParent canvas 父节点
     */
    function fitScreen(canvas, canvasParent) {
        var canvasX;
        var canvasY;
        var canvasScaleX;
        var canvasScaleY;
        var innerWidth = window.innerWidth;
        // var innerWidth = window.innerWidth;
        var innerHeight = window.innerHeight;
        // var innerHeight = window.innerHeight;
        if (innerWidth > 480) {
            innerWidth -= 1;
            innerHeight -= 1;
        }

        if (env.isMobile) {
            if (window.innerWidth > window.innerHeight) {
                if (innerWidth / canvas.width < innerHeight / canvas.height) {
                    canvas.style.width = innerWidth + 'px';
                    canvas.style.height = innerWidth / canvas.width * canvas.height + 'px';
                    canvasX = 0;
                    canvasY = (innerHeight - innerWidth / canvas.width * canvas.height) / 2;
                    canvasScaleX = canvasScaleY = canvas.width / innerWidth;
                    canvasParent.style.marginTop = canvasY + 'px';
                    canvasParent.style.marginLeft = canvasX + 'px';
                }
                else {
                    canvas.style.width = innerHeight / canvas.height * canvas.width + 'px';
                    canvas.style.height = innerHeight + 'px';
                    canvasX = (innerWidth - innerHeight / canvas.height * canvas.width) / 2;
                    canvasY = 0;
                    canvasScaleX = canvasScaleY = canvas.height / innerHeight;
                    canvasParent.style.marginTop = canvasY + 'px';
                    canvasParent.style.marginLeft = canvasX + 'px';
                }
            }
            else {
                canvasX = canvasY = 0;
                canvasScaleX = canvas.width / innerWidth;
                canvasScaleY = canvas.height / innerHeight;
                canvas.style.width = innerWidth + 'px';
                canvas.style.height = innerHeight + 'px';
                canvasParent.style.marginTop = '0px';
                canvasParent.style.marginLeft = '0px';
            }
        }
        else {
            if (innerWidth / canvas.width < innerHeight / canvas.height) {
                canvas.style.width = innerWidth + 'px';
                canvas.style.height = innerWidth / canvas.width * canvas.height + 'px';
                canvasX = 0;
                canvasY = (innerHeight - innerWidth / canvas.width * canvas.height) / 2;
                canvasScaleX = canvasScaleY = canvas.width / innerWidth;
                canvasParent.style.marginTop = canvasY + 'px';
                canvasParent.style.marginLeft = canvasX + 'px';
            }
            else {
                canvas.style.width = innerHeight / canvas.height * canvas.width + 'px';
                canvas.style.height = innerHeight + 'px';
                canvasX = (innerWidth - innerHeight / canvas.height * canvas.width) / 2;
                canvasY = 0;
                canvasScaleX = canvasScaleY = canvas.height / innerHeight;
                canvasParent.style.marginTop = canvasY + 'px';
                canvasParent.style.marginLeft = canvasX + 'px';
            }
        }

        // console.log(canvasX, canvasY, canvasScaleX, canvasScaleY);
    }

    /**
     * 初始化场景，并绑定事件
     *
     * @param {HTML.Element} canvas canvas 节点
     */
    function initStage(canvas) {
        canvas.width = defaultCanvasWidth;
        canvas.height = defaultCanvasHeight;

        var canvasParent = canvas.parentNode;

        fitScreen(canvas, canvasParent);

        window.addEventListener(
            env.supportOrientation ? 'orientationchange' : 'resize',
            function () {
                setTimeout(function() {
                    fitScreen(canvas, canvasParent);
                }, 1);
            },
            false
        );
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

        if (!opts.canvas) {
            throw new Error('Stage must be require a canvas param');
        }

        this.name = (opts.name === null || opts.name === undefined) ? 'ig_stage_' + (guid++) : opts.name;

        this.canvas = util.domWrap(opts.canvas, document.createElement('div'));
        this.ctx = this.canvas.getContext('2d');

        if (opts.width) {
            defaultCanvasWidth = opts.width;
        }

        if (opts.height) {
            defaultCanvasHeight = opts.height;
        }

        initStage(this.canvas);

        this.offCanvas = document.createElement('canvas');
        this.offCtx = this.offCanvas.getContext('2d');
        this.offCanvas.width = this.canvas.width;
        this.offCanvas.style.width = this.canvas.style.width;
        this.offCanvas.height = this.canvas.height;
        this.offCanvas.style.height = this.canvas.style.height;
        this.container = this.canvas.parentNode;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.bgColor = opts.bgColor || '#000';

        // this.setSize();
        this.setBgColor();

        // 当前场景中的所有可显示对象集合
        this.displayObjectList = [];

        // 当前场景中的所有可显示对象，对象，方便读取
        this.displayObjects = {};
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
         */
        clear: function () {
            var me = this;
            me.ctx.clearRect(0, 0, me.width, me.height);
        },

        /**
         * 设置 canvas 的背景颜色
         *
         * @param {string} color 颜色值 #f00, rgba(255, 0, 0, 1), red
         */
        setBgColor: function (color) {
            // debugger
            var me = this;
            me.bgColor = color || me.bgColor;
            me.canvas.style.backgroundColor = me.bgColor;
        },

        /**
         * 设置 canvas 的背景图
         * 设置背景， repeatPattern: center 居中；full 拉伸；默认平铺
         *
         * @param {string} imgUrl 图片 url
         * @param {string} repeatPattern center: 居中; full: 拉伸; 默认平铺
         */
        setBgImg: function (imgUrl, repeatPattern) {
            var me = this;
            me.canvas.style.backgroundImage = 'url(' + imgUrl + ')';
            switch (repeatPattern) {
                // 居中
                case 'center':
                    me.canvas.style.backgroundRepeat = 'no-repeat';
                    me.canvas.style.backgroundPosition = 'center';
                    break;
                // 拉伸
                case 'full':
                    me.canvas.style.backgroundSize = me.width + 'px ' + me.height + 'px';
                    break;
            }
        },

        /**
         * 清除场景
         */
        clean: function () {
            var me = this;
            me.container.removeChild(me.canvas);
            me.container.parentNode.removeChild(me.container);
            me.container = null;
            me.canvas = me.ctx = null;
            me.offCanvas = me.offCtx = null;
        },

        /**
         * 场景的更新，需要更新场景里面的所有精灵
         */
        update: function () {
            var me = this;
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

            me.fire('Stage:beforeRender', {
                data: {
                }
            });

            this.sortDisplayObject();
            this.renderDisplayObject();

            me.fire('Stage:afterRender', {
                data: {
                }
            });
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
            if (!me.getDisplayObjectByName(displayObj.name)) {
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
            this.removeDisplayObjectByName(displayObj.name);
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
