/**
 * @file 场景类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var Event = require('./Event');
    var util = require('./util');
    var DisplayObject = require('./DisplayObject');

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

        // this.canvas = util.domWrap(opts.canvas, document.createElement('div'));
        this.canvas = opts.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.container = this.canvas.parentNode;

        this.guid = 0;
        this.name = (opts.name === null || opts.name === undefined) ? 'ig_stage_' + (this.guid++) : opts.name;

        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.width = opts.width || this.canvas.width;
        this.height = opts.height || this.canvas.height;
        this.containerBgColor = opts.containerBgColor || '#000';

        this.setSize();
        this.setContainerBgColor();

        // 当前场景中的所有可显示对象集合
        this.displayObjectList = [];
        // 当前场景中的所有可显示对象，对象，方便读取
        this.displayObjects = {};

        // this.listeners = [];
        // this.displayObjectList = [];
        // this.displayObjects = {};
    }

    Stage.prototype = {
        constructor: Stage,

        /**
         * 清除
         */
        clear: function () {
            var me = this;
            me.ctx.clearRect(0, 0, me.width, me.height);
        },

        /**
         * 设置 canvas 以及 canvas.container 的宽高
         *
         * @param {number} width 宽度
         * @param {number} height 高度
         */
        setSize: function (width, height) {
            var me = this;
            me.width = width || me.width;
            me.height = height || me.height;

            me.container.style.width = me.width + 'px';
            me.container.style.height = me.height + 'px';

            me.canvas.width = me.width;
            me.canvas.height = me.height;

            console.log(me.canvas);
        },

        /**
         * 设置 canvas.container 的背景颜色
         *
         * @param {string} color 颜色值 #f00, rgba(255, 0, 0, 1), red
         */
        setContainerBgColor: function (color) {
            var me = this;
            me.containerBgColor = me.containerBgColor || '#000';
            me.container.style.backgroundColor = me.containerBgColor;
        },

        /**
         * 设置 canvas.container 的背景图
         * 设置背景， repeatPattern: center 居中；full 拉伸；默认平铺
         *
         * @param {string} imgUrl 图片 url
         * @param {string} repeatPattern center: 居中; full: 拉伸; 默认平铺
         */
        setContainerBgImg: function (imgUrl, repeatPattern) {
            var me = this;
            me.container.style.backgroundImage = 'url(' + imgUrl + ')';
            switch (repeatPattern) {
                // 居中
                case 'center':
                    me.container.style.backgroundRepeat = 'no-repeat';
                    me.container.style.backgroundPosition = 'center';
                    break;
                // 拉伸
                case 'full':
                    me.container.style.backgroundSize = me.width + 'px ' + me.height + 'px';
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
            me.canvas = me.container = me.ctx = null;
        },

        /**
         * 场景的更新，需要更新场景里面的所有精灵
         */
        update: function () {
            for (var i = 0, len = this.displayObjectList.length; i < len; i++) {
                this.displayObjectList[i].update();
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
            me.ctx.save();
            for (var i = 0; i < len; i++) {
                displayObjectStatus = me.displayObjectList[i].status;
                if (displayObjectStatus === 1 || displayObjectStatus === 2) {
                    me.displayObjectList[i].render(me.ctx);
                }
            }
            me.ctx.restore();
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
         * 根据名字获取 displayObject
         *
         * @param {string} name displayObject 的名字
         *
         * @return {Object} displayObject 对象
         */
        getDisplayObjectByName: function (name) {
            return this.displayObjects[name];
        },

        /**
         * 清除所有 displayObject
         */
        clearAllDisplayObject: function () {
            this.displayObjectList = [];
            this.displayObjects = {};
        }
    }

    util.inherits(Stage, Event);

    return Stage;

});
