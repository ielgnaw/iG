/**
 * @file 工具
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var DEG2RAD_OPERAND = Math.PI / 180;
    var RAD2DEG_OPERAND = 180 / Math.PI;

    var objectProto = Object.prototype;

    var exports = {};

    /**
     * 空函数
     */
    exports.noop = function () {};

    /**
     * 对象属性拷贝
     *
     * @param {Object} target 目标对象
     * @param {...Object} source 源对象
     * @return {Object}
     */
    exports.extend = function (target, source) {
        for (var i = 1, len = arguments.length; i < len; i++) {
            source = arguments[i];

            if (!source) {
                continue;
            }

            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }

        }

        return target;
    };

    /**
     * 为类型构造器建立继承关系
     *
     * @param {Function} subClass 子类构造器
     * @param {Function} superClass 父类构造器
     * @return {Function} 返回 subClass 构造器
     */
    exports.inherits = function (subClass, superClass) {

        var Empty = function () {};
        Empty.prototype = superClass.prototype;
        var selfPrototype = subClass.prototype;
        var proto = subClass.prototype = new Empty();

        for (var key in selfPrototype) {
            proto[key] = selfPrototype[key];
        }
        subClass.prototype.constructor = subClass;

        subClass.superClass = superClass.prototype;

        return subClass;
    };

    /**
     * 根据角度计算弧度
     * 弧度 = 角度 * Math.PI / 180
     *
     * @param {number} deg 角度值
     *
     * @return {number} 弧度值
     */
    exports.deg2Rad = function (deg) {
        return deg * DEG2RAD_OPERAND;
    };

    /**
     * 根据弧度计算角度
     * 角度 = 弧度 * 180 / Math.PI
     *
     * @param {number} rad 弧度值
     *
     * @return {number} 角度值
     */
    exports.rad2Deg = function (rad) {
        return rad * RAD2DEG_OPERAND;
    };

    /**
     * 把页面上的鼠标坐标换成相对于 canvas 的坐标
     *
     * @param {HTML.Element} canvas canvas 元素
     * @param {number} x 相对于页面的横坐标
     * @param {number} y 相对于页面的纵坐标
     *
     * @return {Object} 相对于 canvas 的坐标对象
     */
    exports.window2Canvas = function (canvas, x, y) {
        var boundRect = canvas.getBoundingClientRect();
        return {
            x: Math.round(x - boundRect.left * (canvas.width / boundRect.width)),
            y: Math.round(y - boundRect.top * (canvas.height / boundRect.height))
        };
    };

    /**
     * func.apply(thisContext, args);
     *
     * @param {Function} func 待执行函数
     * @param {Object} thisContext 上下文
     * @param {Array} args 参数
     */
    exports.fastApply = function (func, thisContext, args) {
        switch (args.length) {
            case 0:
                return func.call(
                    thisContext
                );
            case 1:
                return func.call(
                    thisContext, args[0]
                );
            case 2:
                return func.call(
                    thisContext, args[0], args[1]
                );
            case 3:
                return func.call(
                    thisContext, args[0], args[1], args[2]
                );
            case 4:
                return func.call(
                    thisContext, args[0], args[1], args[2], args[3]
                );
            case 5:
                return func.call(
                    thisContext, args[0], args[1], args[2], args[3], args[4]
                );
            case 6:
                return func.call(
                    thisContext, args[0], args[1], args[2], args[3], args[4], args[5]
                );
            case 7:
                return func.call(
                    thisContext, args[0], args[1], args[2], args[3], args[4], args[5], args[6]
                );
            case 8:
                return func.call(
                    thisContext, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]
                );
            case 9:
                return func.call(
                    thisContext, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]
                );
            default:
                return func.apply(thisContext, args);
        }
    };

    /**
     * 根据条件删除数组里的第一个满足条件的项，只会删除第一个，改变的是原数组
     *
     * @param {Array} list 待删除的数组
     * @param {Function} callback 条件函数，返回 true 就执行
     */
    exports.removeArrByCondition = function (list, callback) {
        var candidateIndex = -1;
        var tmp;
        for (var i = 0, len = list.length; i < len; i++) {
            tmp = list[i];
            if (callback(tmp)) {
                candidateIndex = i;
                break;
            }
        }

        if (candidateIndex !== -1) {
            list.splice(candidateIndex, 1);
        }
    };

    /**
     * 返回十六进制的颜色值
     *
     * @param {string|number} color 颜色值
     * @param {boolean} toNumber 是否转为纯数字
     *                           toNumber = true 返回纯数字
     *
     * @return {string|number} 颜色值
     */
    exports.parseColor = function (color, toNumber) {
        if (toNumber === true) {
            if (typeof color === 'number') {
                return (color | 0);
            }
            if (typeof color === 'string' && color[0] === '#') {
                color = color.slice(1);
            }
            return parseInt(color, 16);
        }
        else {
            if (typeof color === 'number') {
                color = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
            }
            return color;
        }
    };

    /**
     * 转换颜色为 RGB 格式
     *
     * @param {string|number} color 颜色值
     * @param {number} alpha 透明度
     *
     * @return {string} rgb 或者 rgba 格式的字符串
     */
    exports.colorToRGB = function (color, alpha) {
        if (typeof color === 'string' && color[0] === '#') {
            color = window.parseInt(color.slice(1), 16);
        }
        alpha = (alpha === undefined) ? 1 : alpha;

        var r = color >> 16 & 0xff;
        var g = color >> 8 & 0xff;
        var b = color & 0xff;
        var a = (alpha < 0) ? 0 : ((alpha > 1) ? 1 : alpha);

        if (a === 1) {
            return 'rgb('+ r +','+ g +','+ b +')';
        }
        else {
            return 'rgba('+ r +','+ g +','+ b +','+ a +')';
        }
    };

    /**
     * 生成 min 到 max 范围内的随机整数
     *
     * @param {number} min 最小值
     * @param {number} max 最大值
     *
     * @return {number} min 到 max 之间的随机整数
     */
    exports.randomInt = function (min, max) {
        return Math.floor(Math.random() * max + min);
    };

    /**
     * 生成 min 到 max 范围内的随机数
     *
     * @param {number} min 最小值
     * @param {number} max 最大值
     *
     * @return {number} min 到 max 之间的随机数
     */
    exports.randomFloat = function (min, max) {
        return Math.random() * (max - min) + min;
    };

    /**
     * 为 dom 节点添加一个父节点
     * domWrap(curNode, document.createElement('div'), 'newId');
     *
     * @param {HTML.Element} curNode 待添加父节点的节点
     * @param {HTML.Element} newNode 要作为父节点的节点
     *
     * @return {HTML.Element} 原节点
     */
    exports.domWrap = function (curNode, newNode, newNodeId) {
        // var _el = curNode.cloneNode(true);

        // // newNode = '<div style="color:blue"></div>';
        // if (typeof newNode === 'string') {
        //     var tmp = document.createElement('div');
        //     tmp.innerHTML = newNode;
        //     tmp = tmp.children[0];
        //     tmp.appendChild(_el);
        //     tmp.id = newNodeId;
        //     curNode.parentNode.replaceChild(tmp, curNode);
        // }
        // // newNode = document.createElement('div');
        // else {
        //     newNode.id = newNodeId;
        //     newNode.appendChild(_el);
        //     curNode.parentNode.replaceChild(newNode, curNode);
        // }

        // return _el;

        curNode.parentNode.insertBefore(newNode, curNode);
        newNode.appendChild(curNode);
        newNode.id = newNodeId;

        return curNode;
    };

    /**
     * 获取对象类型
     *
     * @param {*} obj 待检测对象
     *
     * @return {string} 类型
     */
    exports.getType = function (obj) {
        var objectName = objectProto.toString.call(obj);
        var match = /\[object (\w+)\]/.exec(objectName);

        return match[1].toLowerCase();
    };

    /**
     * 把页面上的鼠标坐标换成相对于 canvas 的坐标
     *
     * @param {HTML.Element} canvas canvas 元素
     * @param {number} x 相对于页面的横坐标
     * @param {number} y 相对于页面的纵坐标
     *
     * @return {Object} 相对于 canvas 的坐标对象
     */
    exports.windowToCanvas = function (canvas, x, y) {
        var boundRect = canvas.getBoundingClientRect();
        var width = canvas.width;
        var height = canvas.height;
        return {
            x: Math.round(x - boundRect.left * (width / boundRect.width)),
            y: Math.round(y - boundRect.top * (height / boundRect.height))
        };
    };

    /**
     * 获取鼠标相对于 canvas 的坐标
     * http://stackoverflow.com/a/27204937/2747251
     *
     * @param {HTML.Element} canvas canvas 节点
     * @param {HTML.Event} event dom 事件对象
     *
     * @return {Object} 鼠标相对于 canvas 的坐标
     */
    exports.getMouseCoords = function (canvas, event) {
        var boundRect = canvas.getBoundingClientRect();
        var top = boundRect.top;
        var bottom = boundRect.bottom;
        var left = boundRect.left;
        var right = boundRect.right;

        // border
        var styles = getComputedStyle(canvas, null);
        if (styles) {
            var topBorder = parseInt(styles.getPropertyValue('border-top-width'), 10);
            var rightBorder = parseInt(styles.getPropertyValue('border-right-width'), 10);
            var bottomBorder = parseInt(styles.getPropertyValue('border-bottom-width'), 10);
            var leftBorder = parseInt(styles.getPropertyValue('border-left-width'), 10);
            left += leftBorder;
            right -= rightBorder;
            top += topBorder;
            bottom -= bottomBorder;
        }

        var ret = {};
        ret.x = event.clientX - left;
        ret.y = event.clientY - top;

        var width = right - left;
        // image
        if (canvas.width !== width) {
            var height = bottom - top;
            ret.x = ret.x * (canvas.width / width);
            ret.y = ret.y * (canvas.height / height);
        }

        return ret;
    };

    /**
     * 相对于元素获取鼠标的位置
     *
     * @param {HTML Element} element 相对的 DOM 元素
     *
     * @return {Object} 位置信息 {x, y, event}
     */
    exports.captureMouse = function (element) {
        var ret = {
            x: 0,
            y: 0,
            event: null
        };

        var bodyScrollLeft = document.body.scrollLeft;
        var docElementScrollLeft = document.documentElement.scrollLeft;
        var bodyScrollTop = document.body.scrollTop;
        var docElementScrollTop = document.documentElement.scrollTop;
        var offsetLeft = element.offsetLeft;
        var offsetTop = element.offsetTop;

        element.addEventListener(
            'mousemove',
            function (event) {
                var x;
                var y;

                if (event.pageX || event.pageY) {
                    x = event.pageX;
                    y = event.pageY;
                }
                else {
                    x = event.clientX + bodyScrollLeft + docElementScrollLeft;
                    y = event.clientY + bodyScrollTop + docElementScrollTop;
                }
                x -= offsetLeft;
                y -= offsetTop;

                ret.x = x;
                ret.y = y;
                ret.event = event;
                console.warn(ret);
            },
            false
        );

        return ret;
    };

    /**
     * 相对于元素获取 touch 的位置
     *
     * @param {HTML Element} element 相对的 DOM 元素
     *
     * @return {Object} 位置信息 {x, y, event}
     */
    exports.captureTouch = function (element) {
        var touch = {
            x: null,
            y: null,
            isPressed: false,
            event: null
        };

        var bodyScrollLeft = document.body.scrollLeft;
        var docElementScrollLeft = document.documentElement.scrollLeft;
        var bodyScrollTop = document.body.scrollTop;
        var docElementScrollTop = document.documentElement.scrollTop;
        var offsetLeft = element.offsetLeft;
        var offsetTop = element.offsetTop;

        element.addEventListener(
            'touchstart',
            function (event) {
                touch.isPressed = true;
                touch.event = event;
                console.warn(touch, 'touchstart');
            },
            false
        );

        element.addEventListener(
            'touchend',
            function (event) {
                touch.isPressed = false;
                touch.x = null;
                touch.y = null;
                touch.event = event;
                console.warn(touch, 'touchend');
            },
            false
        );

        element.addEventListener(
            'touchmove',
            function (event) {
                var x;
                var y;
                var touchEvent = event.touches[0];

                if (touchEvent.pageX || touchEvent.pageY) {
                    x = touchEvent.pageX;
                    y = touchEvent.pageY;
                }
                else {
                    x = touchEvent.clientX + bodyScrollLeft + docElementScrollLeft;
                    y = touchEvent.clientY + bodyScrollTop + docElementScrollTop;
                }
                x -= offsetLeft;
                y -= offsetTop;

                touch.x = x;
                touch.y = y;
                touch.event = event;
                console.log(exports.getMouseCoords(touch.event.target, touchEvent));
            },
            false
        );

        return touch;
    };

    return exports;

});
