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
     * 频率控制 返回函数连续调用时，func 执行频率限定为 次 / wait
     * from underscore
     *
     * @param {Function} func 传入函数
     * @param {number} wait 表示时间窗口的间隔
     * @param {Object} options 如果想忽略开始边界上的调用，传入 {leading: false}。
     *                         如果想忽略结尾边界上的调用，传入 {trailing: false}
     * @return {Function} 返回客户调用函数
     */
    exports.throttle = function (func, wait, options) {
        var context;
        var args;
        var result;
        var timeout = null;

        // 上次执行时间点
        var previous = 0;
        if (!options) {
            options = {};
        }

        // 延迟执行函数
        var later = function () {
            // 若设定了开始边界不执行选项，上次执行时间始终为0
            previous = options.leading === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) {
                context = args = null;
            }
        };

        return function () {
            var now = Date.now();

            // 首次执行时，如果设定了开始边界不执行选项，将上次执行时间设定为当前时间。
            if (!previous && options.leading === false) {
                previous = now;
            }

            // 延迟执行时间间隔
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;

            // 延迟时间间隔 remaining <= 0，表示上次执行至此所间隔时间已经超过一个时间窗口
            // remaining 大于时间窗口 wait，表示客户端系统时间被调整过
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                if (!timeout) {
                    context = args = null;
                }
            }
            // 如果延迟执行不存在，且没有设定结尾边界不执行选项
            else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    /**
     * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
     * from underscore
     *
     * @param {Function} func 传入函数
     * @param {number} wait 表示时间窗口的间隔
     * @param {boolean} immediate 设置为 ture 时，调用触发于开始边界而不是结束边界
     * @return {Function} 返回客户调用函数
     */
    exports.debounce = function (func, wait, immediate) {
        var timeout;
        var args;
        var context;
        var timestamp;
        var result;

        var later = function () {
            // 据上一次触发时间间隔
            var last = Date.now() - timestamp;

            // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            }
            else {
                timeout = null;
                // 如果设定为 immediate === true，因为开始边界已经调用过了此处无需调用
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) {
                        context = args = null;
                    }
                }
            }
        };

        return function () {
            context = this;
            args = arguments;
            timestamp = Date.now();
            var callNow = immediate && !timeout;

            // 如果延时不存在，重新设定延时
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }

            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    };

    /**
     * 检测图片 id 或者路径是否在 game.asset 中即是否加载完成
     * spriteSheet Data 和 img 在 game.resource 中是一样的格式
     * 因此这里可以直接用检测图片的方式来检测 spriteSheet Data
     *
     * @param {string} img 图片 id 或者路径
     * @param {Object} gameAsset 游戏资源，加载后的
     * @param {Array} gameResource 游戏资源，初始化设置的
     *
     * @return {?Object} 返回已经加载的资源，如果没有找到，返回 null
     */
    exports.getImgAsset = function (img, gameAsset, gameResource) {
        if (gameAsset[img]) {
            return gameAsset[img];
        }
        for (var i = 0, len = gameResource.length; i < len; i++) {
            if (exports.getType(gameResource[i]) === 'string' && gameResource[i] === img) {
                return gameResource[i];
            }

            if (exports.getType(gameResource[i]) === 'object'
                && gameResource[i].src === img
            ) {
                return gameAsset[gameResource[i].id];
            }
        }

        return null;
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
     * 生成 min 到 max 范围内的随机整数
     *
     * @param {number} min 最小值
     * @param {number} max 最大值
     *
     * @return {number} min 到 max 之间的随机整数
     */
    exports.randomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
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
     * @param {string} newNodeId 新 DOM 的 ID
     *
     * @return {HTML.Element} 原节点
     */
    exports.domWrap = function (curNode, newNode, newNodeId) {
        curNode.parentNode.insertBefore(newNode, curNode);
        newNode.appendChild(curNode);
        newNode.id = newNodeId || ('ig-create-dom-' + Date.now());
        return curNode;
    };

    /**
     * 获取节点的偏移
     *
     * @param {HTML.Element} element dom 节点
     *
     * @return {Object} 偏移量
     */
    exports.getElementOffset = function (element) {
        var x = element.offsetLeft;
        var y = element.offsetTop;
        /* eslint-disable eqeqeq */
        while ((element = element.offsetParent) && element != document.body && element != document) {
            x += element.offsetLeft;
            y += element.offsetTop;
        }
        /* eslint-enable eqeqeq */
        return {
            x: x,
            y: y
        };
    };

    /**
     * 绘制矩形路径
     *
     * @param {number} x 起点横坐标
     * @param {number} y 起点纵坐标
     * @param {number} w 宽度
     * @param {number} h 高度
     * @param {Object} ctx 2d 上下文对象
     * @param {boolean} direction 是否逆时针，true 为逆时针
     */
    exports.rect = function (x, y, w, h, ctx, direction) {
        // CCW 逆时针
        if (direction) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + h);
            ctx.lineTo(x + w, y + h);
            ctx.lineTo(x + w, y);
        }
        // 顺时针
        else {
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y);
            ctx.lineTo(x + w, y + h);
            ctx.lineTo(x, y + h);
        }
        ctx.closePath();
    }

    return exports;

});
