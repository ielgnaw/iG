/**
 * @file 资源加载
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var util = require('./util');

    // 匹配 base64 字符串
    var REG_BASE64 = /^(data:\s*image\/(\w+);\s*base64,)/;

    var Howl = require('./dep/howler').Howl;

    /**
     * 默认的资源类型
     *
     * @type {Object}
     */
    var defaultResourceTypes = {
        png: 'Image',
        jpg: 'Image',
        gif: 'Image',
        jpeg: 'Image',
        ogg: 'Audio',
        wav: 'Audio',
        m4a: 'Audio',
        mp3: 'Audio'
    };

    /**
     * ResourceLoader 类，资源加载，以 game 实例为粒度
     *
     * @constructor
     *
     * @return {Object} ResourceLoader 实例
     */
    function ResourceLoader() {
        // 已经加载的资源，初始化时为空
        this.asset = {};
        return this;
    }

    ResourceLoader.prototype = {
        /**
         * 还原 constructor
         */
        constructor: ResourceLoader,

        /**
         * 加载图片
         *
         * @param {string} id 图片 id
         * @param {string} src 图片路径
         * @param {Function} callback 加载成功回调
         * @param {Function} errorCallback 加载失败回调
         */
        loadImage: function (id, src, callback, errorCallback) {
            var img = new Image();
            img.addEventListener('load', function (e) {
                callback(id, img);
                img = null;
            });
            img.addEventListener('error', function (e) {
                errorCallback(src);
                img = null;
            });
            img.src = src;
        },

        /**
         * 加载其他资源
         *
         * @param {string} id 图片 id
         * @param {string} src 图片路径
         * @param {Function} callback 加载成功回调
         * @param {Function} errorCallback 加载失败回调
         */
        loadOther: function (id, src, callback, errorCallback) {
            var fileExt = getFileExt(src);
            var req = new XMLHttpRequest();

            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        if (fileExt === 'json') {
                            callback(id, JSON.parse(req.responseText));
                        }
                        else {
                            callback(id, req.responseText);
                        }
                    }
                    else {
                        errorCallback(src);
                    }
                }
            };

            req.open('GET', src, true);
            req.send(null);
        },

        /**
         * 加载资源，资源格式为: {id: 'xxxx', src: 'path'} 或 'path'
         *
         * @param {Array | string} resource 资源
         * @param {Function} callback 全部加载完成回调
         * @param {Object} opts 参数配置
         * @param {Function} opts.processCallback 加载每一项完成的回调
         * @param {Object} opts.customResourceTypes 自定义的资源配置，opts.customResourceTypes = {'bmp': 'Image'}
         */
        loadResource: function (resource, callback, opts) {
            var me = this;
            opts = opts || {};

            if (!Array.isArray(resource)) {
                resource = [resource];
            }

            var loadError = false;

            var errorCallback = function (item) {
                loadError = true;
                (opts.errorCallback || function (errItem) {
                    alert('Loading Error: ' + errItem);
                    throw new Error('Loading Error: ' + errItem);
                }).call(me, item);
            };

            var processCallback = opts.processCallback || util.noop;
            var totalCount = resource.length;
            var remainingCount = totalCount;

            var loadOneCallback = function (id, obj) {
                if (loadError) {
                    return;
                }

                if (!me.asset[id]) {
                    me.asset[id] = obj;
                }

                remainingCount--;

                processCallback(totalCount - remainingCount, totalCount);

                if (remainingCount === 0 && callback) {
                    callback.call(me, me.asset);
                }
            };

            var customResourceTypes = opts.customResourceTypes || {};
            var resourceTypes = util.extend({}, defaultResourceTypes, customResourceTypes);

            var delayTimer = (totalCount >= 10 ? 100 : 300);
            if (totalCount <= 10) {
                delayTimer = 300;
            }
            else if (totalCount > 10 && totalCount <= 100) {
                delayTimer = 30;
            }
            else if (totalCount > 100) {
                delayTimer = 10;
            }

            for (var i = 0; i < totalCount; i++) {
                /* jshint loopfunc:true */
                /* eslint-disable no-loop-func */
                (function (index) {
                    var curResource = resource[index];
                    var resourceId;
                    var resourceSrc;
                    if (util.getType(curResource) === 'object') {
                        resourceId = curResource.id;
                        resourceSrc = curResource.src;
                    }
                    else {
                        resourceId = resourceSrc = curResource;
                    }

                    if (!me.asset.hasOwnProperty(resourceId)) {
                        setTimeout(function () {
                            if (util.getType(resourceSrc) === 'array') {
                                /* jshint nonew: false */
                                (function (rId, r) {
                                    var howlOpts = {
                                        urls: resourceSrc,
                                        onload: function () {
                                            loadOneCallback(rId, this);
                                        },
                                        onloaderror: function () {
                                            errorCallback(this._src || this._urls);
                                        }
                                    };
                                    new Howl(util.extend(true, {}, howlOpts, r.opts || {}));
                                })(resourceId, curResource);
                            }
                            else {
                                var invokeMethod = me['load' + resourceTypes[getFileExt(resourceSrc)]];
                                if (!invokeMethod) {
                                    invokeMethod = me.loadOther;
                                }

                                invokeMethod(
                                    resourceId, resourceSrc, loadOneCallback, errorCallback
                                );
                            }
                        }, (index + 1) * delayTimer);
                    }
                    else {
                        loadOneCallback(resourceId, me.asset[resourceId]);
                    }
                })(i);
                /* eslint-enable no-loop-func */
            }
        }
    };

    /**
     * 获取文件的后缀名
     *
     * @param {string} fileName 文件名
     *
     * @return {string} 后缀名
     */
    function getFileExt(fileName) {
        if (REG_BASE64.test(fileName)) {
            return RegExp.$2;
        }
        var segments = fileName.split('.');
        return segments[segments.length - 1].toLowerCase();
    }

    return ResourceLoader;
});
