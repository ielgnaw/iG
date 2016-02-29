/**
 * @file ig 引擎的一些配置
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    /**
     * 配置
     *
     * @type {Object}
     */
    var config = {};

    /**
     * displayObject 的各种状态
     *     1: 可见，每帧需要更新，各种状态都正常
     *     2: 不可见，每帧需要更新，各种状态都正常
     *     3: 可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
     *     4: 不可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
     *     5: 已经销毁（不可见），不需要更新，也不在整体的 DisplayObject 实例集合中了
     *
     * @private
     * @type {Object}
     */
    /* eslint-disable fecs-camelcase */
    var _status = {
        // 可见，每帧需要更新，各种状态都正常
        NORMAL: 1,
        // 不可见，每帧需要更新，各种状态都正常
        NOT_RENDER: 2,
        // 可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
        NOT_UPDATE: 3,
        // 不可见，不需要更新，但还是保存在整体的 DisplayObject 实例集合中
        NOT_RU: 4,
        // 已经销毁（不可见），不需要更新，也不在整体的 DisplayObject 实例集合中了
        DESTROYED: 5
    };
    /* eslint-enable fecs-camelcase */

    Object.defineProperty(config, 'status', {
        configurable: true,
        enumerable: true,
        get: function getter() {
            return _status;
        }
    });

    /**
     * 游戏窗口宽度的默认值
     *
     * @type {number}
     */
    /* eslint-disable fecs-camelcase */
    var _width = 375;
    /* eslint-enable fecs-camelcase */

    Object.defineProperty(config, 'width', {
        configurable: true,
        enumerable: true,
        get: function getter() {
            return _width;
        },
        set: function setter(val) {
            _width = val;
        }
    });

    /**
     * 游戏窗口高度的默认值
     *
     * @type {number}
     */
    /* eslint-disable fecs-camelcase */
    var _height = 627;
    /* eslint-enable fecs-camelcase */

    Object.defineProperty(config, 'height', {
        configurable: true,
        enumerable: true,
        get: function getter() {
            return _height;
        },
        set: function setter(val) {
            _height = val;
        }
    });

    /**
     * 游戏窗口最大宽度的默认值
     *
     * @type {number}
     */
    /* eslint-disable fecs-camelcase */
    var _maxWidth = 5000;
    /* eslint-enable fecs-camelcase */

    Object.defineProperty(config, 'maxWidth', {
        configurable: true,
        enumerable: true,
        get: function getter() {
            return _maxWidth;
        },
        set: function setter(val) {
            _maxWidth = val;
        }
    });

    /**
     * 游戏窗口最大高度的默认值
     *
     * @type {number}
     */
    /* eslint-disable fecs-camelcase */
    var _maxHeight = 5000;
    /* eslint-enable fecs-camelcase */

    Object.defineProperty(config, 'maxHeight', {
        configurable: true,
        enumerable: true,
        get: function getter() {
            return _maxHeight;
        },
        set: function setter(val) {
            _maxHeight = val;
        }
    });

    /**
     * 默认 fps
     *
     * @type {number}
     */
    /* eslint-disable fecs-camelcase */
    var _fps = 60;
    /* eslint-enable fecs-camelcase */

    Object.defineProperty(config, 'fps', {
        configurable: true,
        enumerable: true,
        get: function getter() {
            return _fps;
        },
        set: function setter(val) {
            _fps = val;
            // this.dt = 1000 / val;
        }
    });

    /**
     * 默认 delta
     *
     * @type {number}
     */
    /* eslint-disable fecs-camelcase */
    // var _dt = 1000 / config.fps;
    /* eslint-enable fecs-camelcase */

    Object.defineProperty(config, 'dt', {
        configurable: true,
        enumerable: true,
        get: function getter() {
            // return _dt;
            return 1000 / _fps;
        }
    });

    /**
     * 模块导出对象
     *
     * @type {Object}
     */
    var exports = {};

    /**
     * 设置配置信息
     *
     * @param {string} key key
     * @param {*} value value
     *
     * @return {Object} 配置 config
     */
    exports.setConfig = function (key, value) {
        if (key) {
            config[key] = value;
        }

        return config;
    };

    /**
     * 根据 key 获取配置
     *
     * @param {string} key key，如果 key 不存在，那么返回整个 config
     *
     * @return {Object} key 对应的配置信息
     */
    exports.getConfig = function (key) {
        if (!key) {
            return config;
        }

        return config[key];
    };

    return exports;

});
