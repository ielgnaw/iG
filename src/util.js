/**
 * @file 工具函数
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var DEG2RAD_OPERAND = Math.PI / 180;
    var RAD2DEG_OPERAND = 180 / Math.PI;

    var objectProto = Object.prototype;

    var exports = {};

    /**
     * 空函数
     */
    exports.noop = function () {};

    /**
     * 获取对象类型
     *
     * @param {*} obj 待检测对象
     *
     * @return {string} 类型
     */
    exports.getType = function (obj) {
        var cls = objectProto.toString.call(obj).slice(8, -1);
        return cls.toLowerCase();
    };

    /**
     * 判断是否是某类型
     *
     * @param {string} type 类型
     * @param {*} obj 待判断对象
     *
     * @return {boolean} 结果
     */
    exports.isType = function (type, obj) {
        var objectType = exports.getType(obj);
        return type.toLowerCase() === objectType;
    };

    /**
     * 判断 obj 是否是 window 对象
     * from jQuery
     *
     * @param {Object} obj 待检测对象
     *
     * @return {boolean} 结果
     */
    exports.isWindow = function (obj) {
        return obj != null && obj === obj.window;
    };

    /**
     * 判断 obj 是否是 plainObject
     * from jQuery
     *
     * @param {Object} obj 待检测对象
     *
     * @return {boolean} 结果
     */
    exports.isPlainObject = function (obj) {
        if (exports.getType(obj) !== 'object' || obj.nodeType || exports.isWindow(obj)) {
            return false;
        }

        if (obj.constructor
            && !{}.hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')
        ) {
            return false;
        }
        return true;
    };

    /**
     * 对象/数组合并
     * from jQuery
     *
     * @return {Object | Array} 合并后的对象
     */
    exports.extend = function () {
        var options;
        var name;
        var src;
        var copy;
        var copyIsArray;
        var clone;
        var target = arguments[0] || {};
        var i = 1;
        var length = arguments.length;
        var deep = false;

        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[i] || {};
            i++;
        }

        if (typeof target !== 'object' && !exports.isType('function', target)) {
            target = {};
        }

        if (i === length) {
            target = this;
            i--;
        }

        /* jshint maxdepth: 6 */
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    if (options.hasOwnProperty(name)) {
                        src = target[name];
                        copy = options[name];

                        if (target === copy) {
                            continue;
                        }

                        if (deep && copy && (exports.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && Array.isArray(src) ? src : [];
                            }
                            else {
                                clone = src && exports.isPlainObject(src) ? src : {};
                            }
                            target[name] = exports.extend(deep, clone, copy);
                        }
                        else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
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
            if (selfPrototype.hasOwnProperty(key)) {
                proto[key] = selfPrototype[key];
            }
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
     * 为 dom 节点添加一个父节点
     * domWrap(curNode, document.createElement('div'), 'newId');
     *
     * @param {HTML.Element} curNode 待添加父节点的节点
     * @param {HTML.Element} newNode 要作为父节点的节点
     *
     * @return {HTML.Element} 原节点
     */
    exports.domWrap = function (curNode, newNode, newNodeId) {
        curNode.parentNode.insertBefore(newNode, curNode);
        newNode.appendChild(curNode);
        newNode.id = newNodeId || ('ig-create-dom-' + Date.now());
        return curNode;
    };

    return exports;

});
