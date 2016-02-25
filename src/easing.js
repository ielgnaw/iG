/**
 * @file 缓动代码
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var easing = {};

    /**
     * 无缓动效果，匀速
     *
     * @param {number} t 当前时间
     * @param {number} b 初始值
     * @param {number} c 变化量
     * @param {number} d 持续时间
     *
     * @return {number} 缓动值
     */
    easing.Linear = function (t, b, c, d) {
        return c * t / d + b;
    };

    /**
     * 二次方的缓动（t^2）
     *
     * @type {Object}
     */
    easing.Quad = {

        /**
         * 从 0 开始加速的缓动，先慢后快
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeIn: function (t, b, c, d) {
            return c * (t /= d) * t + b;
        },

        /**
         * 减速到 0 的缓动，先快后慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeOut: function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },

        /**
         * 前半段从 0 开始加速，后半段减速到 0 的缓动，先慢后快然后再慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t + b;
            }
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        }
    };

    /**
     * 三次方的缓动（t^3）
     *
     * @type {Object}
     */
    easing.Cubic = {

        /**
         * 从 0 开始加速的缓动，先慢后快
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeIn: function (t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },

        /**
         * 减速到 0 的缓动，先快后慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeOut: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },

        /**
         * 前半段从 0 开始加速，后半段减速到 0 的缓动，先慢后快然后再慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t * t + b;
            }
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        }
    };

    /**
     * 四次方的缓动（t^4）
     *
     * @type {Object}
     */
    easing.Quart = {

        /**
         * 从 0 开始加速的缓动，先慢后快
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeIn: function (t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },

        /**
         * 减速到 0 的缓动，先快后慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeOut: function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },

        /**
         * 前半段从 0 开始加速，后半段减速到 0 的缓动，先慢后快然后再慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t * t * t + b;
            }
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        }
    };

    /**
     * 五次方的缓动（t^5）
     *
     * @type {Object}
     */
    easing.Quint = {

        /**
         * 从 0 开始加速的缓动，先慢后快
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeIn: function (t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },

        /**
         * 减速到 0 的缓动，先快后慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeOut: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },

        /**
         * 前半段从 0 开始加速，后半段减速到 0 的缓动，先慢后快然后再慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t * t * t * t + b;
            }
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        }
    };

    /**
     * 正弦曲线的缓动（sin(t)）
     *
     * @type {Object}
     */
    easing.Sine = {

        /**
         * 从 0 开始加速的缓动，先慢后快
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeIn: function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },

        /**
         * 减速到 0 的缓动，先快后慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeOut: function (t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },

        /**
         * 前半段从 0 开始加速，后半段减速到 0 的缓动，先慢后快然后再慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeInOut: function (t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        }
    };

    /**
     * 指数曲线的缓动（2^t）
     *
     * @type {Object}
     */
    easing.Expo = {

        /**
         * 从 0 开始加速的缓动，先慢后快
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeIn: function (t, b, c, d) {
            return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },

        /**
         * 减速到 0 的缓动，先快后慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeOut: function (t, b, c, d) {
            return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },

        /**
         * 前半段从 0 开始加速，后半段减速到 0 的缓动，先慢后快然后再慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeInOut: function (t, b, c, d) {
            if (t === 0) {
                return b;
            }
            if (t === d) {
                return b + c;
            }
            if ((t /= d / 2) < 1) {
                return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            }
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    };

    /**
     * 圆形曲线的缓动（sqrt(1-t^2)）
     *
     * @type {Object}
     */
    easing.Circ = {

        /**
         * 从 0 开始加速的缓动，先慢后快
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeIn: function (t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },

        /**
         * 减速到 0 的缓动，先快后慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeOut: function (t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },

        /**
         * 前半段从 0 开始加速，后半段减速到 0 的缓动，先慢后快然后再慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) {
                return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            }
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        }
    };

    /**
     * 指数衰减的正弦曲线缓动
     *
     * @type {Object}
     */
    easing.Elastic = {

        /**
         * 从 0 开始加速的缓动，先慢后快
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         * @param {number} a 自定变化量
         * @param {number} p 自定持续时间
         *
         * @return {number} 缓动值
         */
        easeIn: function (t, b, c, d, a, p) {
            if (t === 0) {
                return b;
            }
            if ((t /= d) === 1) {
                return b + c;
            }
            if (!p) {
                p = d * 0.3;
            }
            var s;
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            }
            else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },

        /**
         * 减速到 0 的缓动，先快后慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         * @param {number} a 自定变化量
         * @param {number} p 自定持续时间
         *
         * @return {number} 缓动值
         */
        easeOut: function (t, b, c, d, a, p) {
            if (t === 0) {
                return b;
            }
            if ((t /= d) === 1) {
                return b + c;
            }
            if (!p) {
                p = d * 0.3;
            }
            var s;
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            }
            else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        },

        /**
         * 前半段从 0 开始加速，后半段减速到 0 的缓动，先慢后快然后再慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         * @param {number} a 自定变化量
         * @param {number} p 自定持续时间
         *
         * @return {number} 缓动值
         */
        easeInOut: function (t, b, c, d, a, p) {
            if (t === 0) {
                return b;
            }
            if ((t /= d / 2) === 2) {
                return b + c;
            }
            if (!p) {
                p = d * (0.3 * 1.5);
            }
            var s;
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            }
            else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            if (t < 1) {
                return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            }
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
        }
    };

    /**
     * 超过范围的三次方缓动（(s+1)*t^3 – s*t^2）
     *
     * @type {Object}
     */
    easing.Back = {

        /**
         * 从 0 开始加速的缓动，先慢后快
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         * @param {number} s 范围
         *
         * @return {number} 缓动值
         */
        easeIn: function (t, b, c, d, s) {
            if (s === void 0) {
                s = 1.70158;
            }
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },

        /**
         * 减速到 0 的缓动，先快后慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         * @param {number} s 范围
         *
         * @return {number} 缓动值
         */
        easeOut: function (t, b, c, d, s) {
            if (s === void 0) {
                s = 1.70158;
            }
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },

        /**
         * 前半段从 0 开始加速，后半段减速到 0 的缓动，先慢后快然后再慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         * @param {number} s 范围
         *
         * @return {number} 缓动值
         */
        easeInOut: function (t, b, c, d, s) {
            if (s === void 0) {
                s = 1.70158;
            }
            if ((t /= d / 2) < 1) {
                return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            }
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        }
    };

    /**
     * 指数衰减的反弹缓动
     *
     * @type {Object}
     */
    easing.Bounce = {

        /**
         * 从 0 开始加速的缓动，先慢后快
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeIn: function (t, b, c, d) {
            return c - easing.Bounce.easeOut(d - t, 0, c, d) + b;
        },

        /**
         * 减速到 0 的缓动，先快后慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeOut: function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            }
            else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
            }
            else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
            }
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        },

        /**
         * 前半段从 0 开始加速，后半段减速到 0 的缓动，先慢后快然后再慢
         *
         * @param {number} t 当前时间
         * @param {number} b 初始值
         * @param {number} c 变化量
         * @param {number} d 持续时间
         *
         * @return {number} 缓动值
         */
        easeInOut: function (t, b, c, d) {
            if (t < d / 2) {
                return easing.Bounce.easeIn(t * 2, 0, c, d) * 0.5 + b;
            }
            return easing.Bounce.easeOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    };

    return easing;
});
