/**
 * @file Description
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var util = {};

    /**
     * 相对于元素获取鼠标的位置
     *
     * @param {HTML Element} element 相对的 DOM 元素
     *
     * @return {Object} 位置信息 {x, y, event}
     */
    util.captureMouse = function (element) {
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
    util.captureTouch = function (element) {
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
            },
            false
        );

        element.addEventListener(
            'touchmove',
            function (event) {
                var x;
                var y;
                var touchEvent = event.touches[0]; //first touch

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
            },
            false
        );

        return touch;
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
    util.parseColor = function (color, toNumber) {
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
    util.colorToRGB = function (color, alpha) {
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
     * 判断点是否在矩形内部
     *
     * @param {Object} rect 矩形对象
     * @param {number} rect.x 矩形顶点横坐标
     * @param {number} rect.y 矩形顶点纵坐标
     * @param {number} rect.width 矩形宽度
     * @param {number} rect.height 矩形高度
     * @param {number} x 待检测点的横坐标
     * @param {number} y 待检测点的纵坐标
     *
     * @return {boolean} 点是否在矩形内
     */
    util.containsPoint = function (rect, x, y) {
        return !(
            x < rect.x // 横坐标在矩形顶点横坐标左外面
                || x > rect.x + rect.width // 横坐标在矩形顶点横坐标右外面
                || y < rect.y // 纵坐标在矩形顶点纵坐标上外面
                || y > rect.y + rect.height // 纵坐标在矩形顶点纵坐标下外面
        );
    };

    /**
     * 判断两个矩形是否相交
     *
     * @param {Object} rectA 矩形对象
     * @param {number} rectA.x 矩形顶点横坐标
     * @param {number} rectA.y 矩形顶点纵坐标
     * @param {number} rectA.width 矩形宽度
     * @param {number} rectA.height 矩形高度
     * @param {Object} rectB 矩形对象
     * @param {number} rectB.x 矩形顶点横坐标
     * @param {number} rectB.y 矩形顶点纵坐标
     * @param {number} rectB.width 矩形宽度
     * @param {number} rectB.height 矩形高度
     *
     * @return {boolean} 矩形是否相交
     */
    util.intersects = function (rectA, rectB) {
        return !(
            rectA.x + rectA.width < rectB.x
                || rectB.x + rectB.width < rectA.x
                || rectA.y + rectA.height < rectB.y
                || rectB.y + rectB.height < rectA.y
        );
    };

    /**
     * 判断一个矩形是否在另一个矩形内部，完全在内部
     *
     * @param {Object} inner 要判断是否在内部的矩形对象
     * @param {Object} outer 容器矩形对象
     * @param {Object} deviation 差值对象
     * @param {string} deviation.way 方位，w 宽度，h 高度
     * @param {number} deviation.value 值
     *
     * @return {boolean} 是否在矩形内部
     */
    util.inSide = function (inner, outer, deviation) {
        var innerX = inner.x;
        var innerY = inner.y;
        var innerW = inner.width;
        var innerH = inner.height;
        var outerX = outer.x;
        var outerY = outer.y;
        var outerW = outer.width;
        var outerH = outer.height;

        var deviationX = 0;
        var deviationY = 0;

        if (deviation) {
            if (deviation.way === 'w') {
                deviationX = deviation.value;
            }
            else if (deviation.way === 'h') {
                deviationY = deviation.value;
            }
        }

        var ret = ((innerX >= outerX + deviationX) && (innerX + innerW) <= (outerX + outerW + deviationX))
            && ((innerY >= outerY + deviationY) && (innerY + innerH) <= (outerY + outerH + deviationY));

        return ret;
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
    util.windowToCanvas = function (canvas, x, y) {
        var boundRect = canvas.getBoundingClientRect();
        var width = canvas.width;
        var height = canvas.height;
        return {
            x: Math.round(x - boundRect.left * (width / boundRect.width)),
            y: Math.round(y - boundRect.top * (height / boundRect.height))
        };
    };

    /**
     * 计算两点的距离
     *
     * @param {number} x1 第一个点的横坐标
     * @param {number} y1 第一个点的纵坐标
     * @param {number} x2 第二个点的横坐标
     * @param {number} y2 第二个点的纵坐标
     *
     * @return {number} 两点间的距离
     */
    util.getDistance = function (x1, y1, x2, y2) {
        var xDistance = x1 - x2;
        var yDistance = y1 - y2;
        return Math.sqrt(
            Math.pow(xDistance, 2) + Math.pow(yDistance, 2)
        );
    };

    /**
     * 画表格
     *
     * @param {HTML.Element} canvas canvas 元素
     * @param {string} color 颜色
     * @param {number} stepx 横
     * @param {number} stepy 纵
     */
    util.drawGrid = function (canvas, color, stepx, stepy) {
        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;

        for (var i = stepx + 0.5; i < canvas.width; i += stepx) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }

        for (var i = stepy + 0.5; i < canvas.width; i += stepy) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
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
    util.random = function (min, max) {
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
    util.randomFloat = function (min, max) {
        return Math.random() * (max - min) + min;
    };

    /**
     * 根据角度获取 Math.tan 的值
     * 正常的 Math.tan 的参数是弧度，
     * 弧度 = 角度 * Math.PI / 180
     * 角度 = 弧度 * 180 / Math.PI
     *
     * @param {number} angle 角度
     *
     * @return {number} Math.tan 结果
     */
    util.getTanByAngle = function (angle) {
        return Math.tan(angle * Math.PI / 180);
    };

    /**
     * 生成 guid
     *
     * @return {string} guid
     */
    util.createGuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function (c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            }
        );
    };

    /**
     * 为类型构造器建立继承关系
     *
     * @param {Function} subClass 子类构造器
     * @param {Function} superClass 父类构造器
     * @return {Function} 返回`subClass`构造器
     */
    util.inherits = function (subClass, superClass) {
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

    util.pageSize = (function () {
        var xScroll;
        var yScroll;
        if (window.innerHeight && window.scrollMaxY) {
            xScroll = window.innerWidth + window.scrollMaxX;
            yScroll = window.innerHeight + window.scrollMaxY;
        }
        else {
            if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac
                xScroll = document.body.scrollWidth;
                yScroll = document.body.scrollHeight;
            }
            else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
                xScroll = document.body.offsetWidth;
                yScroll = document.body.offsetHeight;
            }
        }
        var windowWidth;
        var windowHeight;
        if (self.innerHeight) { // all except Explorer
            if (document.documentElement.clientWidth) {
                windowWidth = document.documentElement.clientWidth;
            }
            else {
                windowWidth = self.innerWidth;
            }
            windowHeight = self.innerHeight;
        }
        else {
            if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
                windowWidth = document.documentElement.clientWidth;
                windowHeight = document.documentElement.clientHeight;
            }
            else {
                if (document.body) { // other Explorers
                    windowWidth = document.body.clientWidth;
                    windowHeight = document.body.clientHeight;
                }
            }
        }
        // for small pages with total height less then height of the viewport
        if (yScroll < windowHeight) {
            pageHeight = windowHeight;
        }
        else {
            pageHeight = yScroll;
        }
        // for small pages with total width less then width of the viewport
        if (xScroll < windowWidth) {
            pageWidth = xScroll;
        }
        else {
            pageWidth = windowWidth;
        }

        return {
            page: {
                w: pageWidth,
                h: pageHeight
            },
            win: {
                w: windowWidth,
                h: windowHeight
            }
        }
    })();

    return util;

});
