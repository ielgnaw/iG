/**
 * @file 最大优先队列
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var util = require('./util');
    var Event = require('./Event');

    /**
     * 队列元素类
     *
     * @param {*} item 队列元素
     * @param {number} priority 优先级，优先级越高越大，默认为 0
     */
    function QueueItem(item, priority) {
        this.item = item;
        this.priority = priority;
    }

    /**
     * Queue
     *
     * @return {Object} Queue 实例
     */
    function Queue() {
        this.items = [];

        // 最大优先级的那个元素，默认为 null
        // 最大优先级元素暂只记录一个，多个相同优先级时只会记录最后添加的那个
        this.maxItem = null;

        // 当前索引
        this.index = -1;

        return this;
    }

    var p = Queue.prototype;

    /**
     * 入队
     *
     * @param {*} item 队列元素
     * @param {number} priority 优先级，优先级越大越高，默认为 0
     *
     * @return {Object} 当前队列实例对象
     */
    p.enqueue = function (item, priority) {
        if (!priority) {
            priority = 0;
        }

        var queueItem = new QueueItem(item, priority);

        if (this.isEmpty()) {
            this.items.push(queueItem);
            this.maxItem = queueItem;
        }
        else {
            var isAdd = false;
            var i = -1;
            var length = this.items.length;

            while (++i < length) {
                if (queueItem.priority > this.items[i].priority) {
                    this.items.splice(i, 0, queueItem);

                    // 如果插入的那个队列元素在队列中的位置在当前 index 所指元素的前面
                    // 就把当前 index 顺序往后移动一位
                    if (i <= this.index) {
                        this.index++;
                    }
                    isAdd = true;
                    this.maxItem = queueItem;
                    break;
                }
            }

            if (!isAdd) {
                this.items.push(queueItem);
            }
        }

        return this;
    };

    /**
     * 出队
     *
     * @return {*} 出队的那个队列元素
     */
    p.dequeue = function () {
        return this.items.shift();
    };

    /**
     * 队列头部元素
     *
     * @return {*} 队列元素
     */
    p.head = function () {
        return this.items[0];
    };

    /**
     * 队列尾部元素
     *
     * @return {*} 队列元素
     */
    p.tail = function () {
        return this.items[this.items.length - 1];
    };

    /**
     * 队列的大小
     *
     * @return {number} 队列的大小
     */
    p.size = function () {
        return this.items.length;
    };

    /**
     * 获取优先级最大的那个元素
     *
     * @return {*} 队列元素
     */
    p.max = function () {
        return this.maxItem;
    };

    /**
     * 正序获取队列的下一个元素，默认从头开始
     * 如果已经到队列最后一个元素，那么下一个元素就是队列第一个元素
     *
     * @return {*} 队列元素
     */
    p.pick = function () {
        this.index++;
        if (this.index === this.items.length) {
            this.index = 0;
        }

        return this.items[this.index];
    };

    /**
     * 判断队列是否为空
     *
     * @return {boolean} 是否为空
     */
    p.isEmpty = function () {
        return this.items.length === 0;
    };

    /**
     * 清空队列
     *
     * @return {Object} 当前队列实例对象
     */
    p.clear = function () {
        this.maxItem = null;
        this.items.length = 0;
        return this;
    };

    /**
     * 输出队列元素
     */
    p.print = function () {
        var i = -1;
        var length = this.items.length;

        /* eslint-disable no-console */
        while (++i < length) {
            console.log(this.items[i].item + ' - ' + this.items[i].priority);
        }
        /* eslint-enable no-console */
    };

    util.inherits(Queue, Event);

    return Queue;
});
