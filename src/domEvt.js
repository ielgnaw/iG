/**
 * @file DOM 事件的初始化模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var util = require('./util');
    var env = require('./env');

    var TOUCH_EVENTS = ['touchstart', 'touchmove', 'touchend'];

    var MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup'];

    // 获取 move 时，touch/mouse 点经过的所有可 mouseEnable 的 sprite
    // touchmove, mousemove 时，把所有经过的可 mouseEnable 的精灵缓存起来
    var holdSprites = [];

    /**
     * 根据精灵名字判断精灵是否在 holdSprites 中
     *
     * @param {string} displayObjectName 精灵名字
     *
     * @return {boolean} 结果
     */
    function inHoldSprites(displayObjectName) {
        for (var i = 0, len = holdSprites.length; i < len; i++) {
            if (holdSprites[i].p.name === displayObjectName) {
                return true;
            }
        }
        return false;
    }

    var exports = {};

    exports.events = env.supportTouch ? TOUCH_EVENTS : MOUSE_EVENTS;

    /**
     * 事件的触发
     *
     * @type {Object}
     */
    exports.fireEvt = {};

    /**
     * touchstart 和 mousedown 事件触发
     *
     * @param {Object} e 事件对象
     *
     * @return {Object} Stage 实例
     */
    exports.fireEvt.touchstart = exports.fireEvt.mousedown = function (e) {
        var target = e.target;
        var displayObjectList = target.p.displayObjectList;
        for (var i = 0, len = displayObjectList.length; i < len; i++) {
            var curDisplayObject = displayObjectList[i];

            if (curDisplayObject.p.mouseEnable
                && curDisplayObject.hitTestPoint
                && curDisplayObject.hitTestPoint(e.data.x, e.data.y)) {
                e.data.curStage = target;
                curDisplayObject.p.isCapture = true;

                // 这里 call 的时候返回的是坐标数据，this 的指向是当前的 displayObject
                curDisplayObject.captureFunc.call(curDisplayObject, e.data);
            }
        }
        return target;
    };

    /**
     * touchmove 和 mousemove 事件触发
     *
     * @param {Object} e 事件对象
     *
     * @return {Object} Stage 实例
     */
    exports.fireEvt.touchmove = exports.fireEvt.mousemove = function (e) {
        var target = e.target;
        var displayObjectList = target.p.displayObjectList;
        for (var i = 0, len = displayObjectList.length; i < len; i++) {
            var curDisplayObject = displayObjectList[i];

            // 获取 move 时，touch/mouse 点经过的所有可 mouseEnable 的 sprite
            if (curDisplayObject.hitTestPoint
                && curDisplayObject.hitTestPoint(e.data.x, e.data.y)
                && !inHoldSprites(curDisplayObject.p.name)
            ) {
                holdSprites.push(curDisplayObject);
            }

            e.data.holdSprites = holdSprites;

            if (curDisplayObject.p.mouseEnable && curDisplayObject.p.isCapture) {
                // 这里 call 的时候返回的是坐标数据，this 的指向是当前的 displayObject
                e.data.curStage = target;
                curDisplayObject.moveFunc.call(curDisplayObject, e.data);
            }
        }
        return target;
    };

    /**
     * touchend 和 mouseup 事件触发
     *
     * @param {Object} e 事件对象
     *
     * @return {Object} Stage 实例
     */
    exports.fireEvt.touchend = exports.fireEvt.mouseup = function (e) {
        var target = e.target;
        var displayObjectList = target.p.displayObjectList;
        for (var i = 0, len = displayObjectList.length; i < len; i++) {
            var curDisplayObject = displayObjectList[i];
            if (curDisplayObject.p.isCapture || inHoldSprites(curDisplayObject.p.name)) {
                curDisplayObject.releaseFunc.call(curDisplayObject, e.data);
                curDisplayObject.p.isCapture = false;
            }
        }
        holdSprites = [];
        return target;
    };

    /**
     * 初始化鼠标事件
     *
     * @param {Object} stage 场景实例
     *
     * @return {Object} export 对象
     */
    exports.initMouse = function (stage) {
        this.stage = stage;
        this.element = stage.p.canvas;
        this.x = 0;
        this.y = 0;
        this.isDown = false;

        var offset = util.getElementOffset(this.element);
        this.offsetX = offset.x;
        this.offsetY = offset.y;
        this.addEvent();
        return this;
    };

    /**
     * 绑定事件
     */
    exports.addEvent = function () {
        var me = this;
        var elem = me.element;
        me.events.forEach(function (name, i) {
            elem.addEventListener(name, function (e) {
                e.preventDefault();

                if (i === 0) {
                    me.isDown = true;
                }
                else if (i === 2) {
                    me.isDown = false;
                }

                var x = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
                var y = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;

                me.x = x - me.offsetX;
                me.y = y - me.offsetY;
                me.stage.fire(name, {
                    data: {
                        x: me.x,
                        y: me.y,
                        isDown: me.isDown
                    }
                });
            });
        });
    };

    return exports;
});
