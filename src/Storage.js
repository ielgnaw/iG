/**
 * @file Storage 类，from saber-storage
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var util = require('./util');
    var env = require('./env');
    var Event = require('./Event');

    var STORAGE_ID = '_IG';

    var EVENT = {
        OUT_OF_LIMIT: 'Out of space limit'
    };

    var stringify = function (v) {
        return JSON.stringify(v);
    };

    var parse = function (v) {
        try {
            v = JSON.parse(v);
        }
        catch (e) {}
        return v;
    };

    var memoryStorage = {
        data: {},
        setItem: function (k, v) {
            this.data[k] = v;
        },

        getItem: function (k) {
            return this.data[k];
        },

        removeItem: function (k) {
            delete this.data[k];
        }
    };

    /**
     * Storage
     *
     * @param {Object} opts 配置项
     * @param {string} opts.storageId 存储命名空间，默认存储在 _IG 命名空间下
     * @param {boolean} opts.memoryCache 是否开启内存级别缓存，即只存储至内存变量中，而不持久化数据。默认 false。
     *
     * @return {Object} Storage 实例
     */
    function Storage(opts) {
        util.extend(true, this, {
            // storageId
            storageId: STORAGE_ID,
            // memoryCache
            memoryCache: false
        }, opts);

        this.storage = (env.supportLocalStorage && !this.memoryCache) ? window.localStorage : memoryStorage;

        return this;
    }

    Storage.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Storage,

        /**
         * 存入数据
         *
         * @param {string} key 键
         * @param {Object} val 值
         * @return {boolean} 存储成功返回 true；存储失败返回 false，并抛出 Stroage.Event.OUT_OF_LIMIT 事件
         *         注意：value 会使用环境内置的 JSON.stringify 方法序列化。
         *         其中 undefined 在 Object 结构下会被忽略，在 Array 结构下会被转换为 null，使用时请注意！
         */
        setItem: function (key, val) {
            var data = this._getData();
            data[key] = val;
            try {
                this.storage.setItem(this.storageId, stringify(data));
                return true;
            }
            catch (err) {
                this.fire(EVENT.OUT_OF_LIMIT, {
                    data: err
                });
                return false;
            }
        },

        /**
         * 根据 key 返回数据
         *
         * @param {string} key 键
         *
         * @return {Object} 数据
         */
        getItem: function (key) {
            return this._getData()[key];
        },

        /**
         * 移除某键位下的数据
         *
         * @param {string} key 键
         */
        removeItem: function (key) {
            var data = this._getData();
            delete data[key];
            this.storage.setItem(this.storageId, stringify(data));
        },

        /**
         * 清空已持久化的数据
         *
         */
        clear: function () {
            this.storage.removeItem(this.storageId);
        },

        /**
         * 获得持久化数据的 key
         *
         * @return {Array}
         */
        key: function () {
            return Object.keys(this._getData());
        },

        /**
         * 获取存于 STORAGE_ID 下的数据
         *
         * @private
         *
         * @return {Object}
         */
        _getData: function () {
            var data = this.storage.getItem(this.storageId);
            return data ? parse(data) : {};
        }
    };

    util.inherits(Storage, Event);

    return Storage;
});
