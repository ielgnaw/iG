/**
 * @file 帧监控类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    /**
     * FrameMonitor 类
     *
     * @constructor
     */
    function FrameMonitor() {
        // 最大帧数
        this.max = 0;
        // 最小帧数
        this.min = 9999;
        // 实时帧数
        this.cur = 0;
        // 当前时间
        this.curTime = 0;
        // 每帧消耗的时间
        this.expendPerFrame = 0;
        // 统计每秒开始时间
        this.startTimePerSecond = 0;
        // 统计每秒总帧数
        this.totalPerSecond = 0;
    }

    FrameMonitor.prototype = {
        /**
         * 还原 constructor
         */
        constructor: FrameMonitor,

        /**
         * 重置，游戏重新开始的时候
         */
        reset: function () {
            var me = this;
            me.max = 0;
            me.min = 9999;
            me.cur = 0;
            me.curTime = 0;
            me.expendPerFrame = 0;
            me.startTimePerSecond = 0;
            me.totalPerSecond = 0;
        },

        /**
         * 启动帧状态监控
         */
        start: function () {
            this.curTime = this.startTimePerSecond = +new Date();
        },

        /**
         * 游戏循环前调用此方法，更新和计算帧数
         */
        update: function () {
            var cTime = +new Date();
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
    };

    return FrameMonitor;

});
