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
