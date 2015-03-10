/**
 * @file 主入口文件
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    /**
     * requestAnimationFrame polyfill
     */
    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.msRequestAnimationFrame
            || window.oRequestAnimationFrame
            || function (callback, elem) {
                    var me = this;
                    var start;
                    var finish;
                    setTimeout(function () {
                        start = +new Date();
                        callback(start);
                        finish = +new Date();
                        me.timeout = 1000 / 60 - (finish - start);
                    }, me.timeout);
                };
    })();

    /**
     * cancelAnimationFrame polyfill
     */
    window.cancelAnimationFrame = (function () {
        return window.cancelAnimationFrame
                || window.webkitCancelAnimationFrame
                || window.webkitCancelRequestAnimationFrame
                || window.mozCancelAnimationFrame
                || window.mozCancelRequestAnimationFrame
                || window.msCancelAnimationFrame
                || window.msCancelRequestAnimationFrame
                || window.oCancelAnimationFrame
                || window.oCancelRequestAnimationFrame
                || window.clearTimeout;
    })();

    var exports = {};

    /**
     * 帧状态
     *
     * @type {Object}
     */
    exports.frameMonitor = {
        // 最大帧数
        max: 0,
        // 最小帧数
        min: 9999,
        // 实时帧数
        cur: 0,
        // 当前时间
        curTime: 0,
        // 每帧消耗的时间
        expendPerFrame: 0,
        // 统计每秒开始时间
        startTimePerSecond: 0,
        // 统计每秒总帧数
        totalPerSecond: 0,
        // 启动帧状态检测
        start: function () {
            this.curTime = this.startTimePerSecond = new Date();
        },
        // 每帧在游戏循环前调用此方法，更新和计算帧数
        update: function () {
            var cTime = new Date();
            if (cTime - this.startTimePerSecond >= 1000) {
                // 当前帧数
                this.cur = this.totalPerSecond;
                this.max = (this.cur > this.max) ? this.cur : this.max;
                this.min = (this.cur < this.min) ? this.cur : this.min;
                this.totalPerSecond = 0;
                this.startTimePerSecond = cTime;
            }
            else {
                ++this.totalPerSecond;
            }
            this.expendPerFrame = cTime - this.curTime;
            this.curTime = cTime;
        }
    }

    return exports;

});
