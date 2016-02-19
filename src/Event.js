/**
 * @file 事件基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var guidKey = '_observerGUID';

    /**
     * 提供与事件相关的操作的基类
     *
     * @constructor
     */
    function Event() {
        this._events = {};
    }

    var p = Event.prototype;

    /**
     * 注册一个事件处理函数
     *
     * @public
     *
     * @param {string} type 事件的类型，如果类型为`*`则在所有事件触发时执行
     * @param {Function} handler 事件的处理函数
     *
     * @return {Object} 当前 Event 绑定的实例对象
     */
    p.on = function (type, handler) {
        if (!this._events) {
            this._events = {};
        }

        var pool = this._events[type];
        if (!pool) {
            pool = this._events[type] = [];
        }
        if (!handler.hasOwnProperty(guidKey)) {
            handler[guidKey] = +new Date();
        }
        pool.push(handler);

        return this;
    };

    /**
     * 注销一个事件处理函数
     *
     * @public
     *
     * @param {string} type 事件的类型，
     *                      如果值为`*`仅会注销通过`*`为类型注册的事件，并不会将所有事件注销
     * @param {Function=} handler 事件的处理函数，
     *                            无此参数则注销`type`指定类型的所有事件处理函数
     *
     * @return {Object} 当前 Event 绑定的实例对象
     */
    p.un = function (type, handler) {
        if (!this._events) {
            return;
        }

        if (!handler) {
            this._events[type] = [];
            return;
        }

        var pool = this._events[type];
        if (pool) {
            for (var i = 0; i < pool.length; i++) {
                if (pool[i] === handler) {
                    pool.splice(i, 1);
                    // 当前Event实现去重是在`fire`阶段做的，
                    // 因此可能通过`on`注册多个相同的handler，
                    // 所以继续循环，不作退出处理
                    i--;
                }
            }
        }

        return this;
    };

    /**
     * 触发指定类型的事件
     *
     * 事件处理函数的执行顺序如下：
     *
     * 1. 如果对象上存在名称为`on{type}`的方法，执行该方法
     * 2. 按照事件注册时的先后顺序，依次执行类型为`type`的处理函数
     * 3. 按照事件注册时的先后顺序，依次执行类型为`*`的处理函数
     *
     * 关于事件对象，分为以下2种情况：
     *
     * - 如果`event`参数是个对象，则会添加`type`属性后传递给处理函数
     * - 其它情况下，`event`参数的值将作为事件对象中的`data`属性
     *
     * 事件处理函数有去重功能，同一个事件处理函数只会执行一次
     *
     * @param {string=} type 事件类型
     * @param {Object=} event 事件对象
     * @public
     */
    p.fire = function (type, event) {
        // `.fire({ type: click, data: 'data' })`这样的情况
        if (arguments.length === 1 && typeof type === 'object') {
            event = type;
            type = event.type;
        }

        // 无论`this._events`有没有被初始化，
        // 如果有直接挂在对象上的方法是要触发的
        var inlineHandler = this['on' + type];
        if (typeof inlineHandler === 'function') {
            inlineHandler.call(this, event);
        }

        if (!this._events) {
            return;
        }

        // 到了这里，有`.fire(type)`和`.fire(type, event)`两种情况
        if (event == null) {
            event = {};
        }
        if (Object.prototype.toString.call(event) !== '[object Object]') {
            event = {data: event};
        }
        event.type = type;
        event.target = this;

        var alreadyInvoked = {};
        var pool = this._events[type];
        if (pool) {
            // 由于在执行过程中，某个处理函数可能会用`un`取消事件的绑定，
            // 这可能导致循环过程中`i`的不准确，因此复制一份。
            // 这个策略会使得在事件处理函数中把后续的处理函数取消掉在当前无效。
            //
            // NOTICE: 这个性能不高，有空再改改
            pool = pool.slice();

            for (var i = 0; i < pool.length; i++) {
                var handler = pool[i];
                if (!alreadyInvoked.hasOwnProperty(handler[guidKey])) {
                    handler.call(this, event);
                }
            }
        }

        // 类型为`*`的事件在所有事件触发时都要触发
        if (type !== '*') {
            var allPool = this._events['*'];
            if (!allPool) {
                return;
            }

            allPool = allPool.slice();

            /* eslint-disable no-redeclare */
            for (var i = 0; i < allPool.length; i++) {
                var handler = allPool[i];
                if (!alreadyInvoked.hasOwnProperty(handler[guidKey])) {
                    handler.call(this, event);
                }
            }
            /* eslint-enable no-redeclare */
        }
    };

    /**
     * 清除所有
     */
    p.clearEvents = function () {
        this._events = {};
    };

    /**
     * 在无继承关系的情况下，使一个对象拥有事件处理的功能
     *
     * @param {*} target 需要支持事件处理功能的对象
     */
    p.enable = function (target) {
        target._events = {};
        target.on = Event.prototype.on;
        target.un = Event.prototype.un;
        target.fire = Event.prototype.fire;
    };

    return Event;

});
