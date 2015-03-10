/**
 * @file 场景类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var util = require('./util');

    /**
     * 场景类构造函数
     * 可以把场景想象成 canvas 以及 canvas 的容器
     *
     * @constructor
     *
     * @param {Object} opts 参数
     */
    function Stage(opts) {
        opts = opts || {};

        if (!opts.canvas) {
            throw new Error('Stage must be require a canvas param');
        }

        // this.canvas = util.domWrap(opts.canvas, document.createElement('div'));
        this.canvas = opts.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.container = this.canvas.parentNode;

        this.guid = 0;
        this.stageName = opts.stageName || 'ig_stage_' + (++this.guid);

        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.width = opts.width || this.canvas.width;
        this.height = opts.height || this.canvas.height;
        this.containerBgColor = opts.containerBgColor || '#000';

        this.setSize();
        this.setContainerBgColor();

        // this.listeners = [];
        // this.displayObjs = [];
        // this.namedDisplayObjs = {};
    }

    Stage.prototype = {
        constructor: Stage,

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
            this.container.style.backgroundColor = me.containerBgColor;
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
                    me.container.style.backgroundSize = this.width + 'px ' + this.height + 'px';
                    break;
            }
        },
    }

    return Stage;

});
