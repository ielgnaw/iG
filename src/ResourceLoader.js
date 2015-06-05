/**
 * @file 资源加载
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var util = require('./util');

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
            var _id;
            var _src;
            var _callback;
            var _errorCallback;

            var argLength = arguments.length;
            switch (argLength) {
                case 1:
                    _id = _src = arguments[0];
                    _callback = _errorCallback = util.noop;
                    break;
                case 2:
                    _id = _src = arguments[0];
                    _callback = _errorCallback = arguments[1];
                    break;
                case 3:
                    _id = _src = arguments[0];
                    _callback = arguments[1];
                    _errorCallback = arguments[2];
                    break;
                default:
                    _id = arguments[0];
                    _src = arguments[1];
                    _callback = arguments[2];
                    _errorCallback = arguments[3];
            }

            var img = new Image();
            img.addEventListener('load', function (e) {
                _callback(_id, img);
            });
            img.addEventListener('error', function (e) {
                _errorCallback(_src);
            });
            img.src = _src;
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
            var _id;
            var _src;
            var _callback;
            var _errorCallback;

            var argLength = arguments.length;
            switch (argLength) {
                case 1:
                    _id = _src = arguments[0];
                    _callback = _errorCallback = util.noop;
                    break;
                case 2:
                    _id = _src = arguments[0];
                    _callback = _errorCallback = arguments[1];
                    break;
                case 3:
                    _id = _src = arguments[0];
                    _callback = arguments[1];
                    _errorCallback = arguments[2];
                    break;
                default:
                    _id = arguments[0];
                    _src = arguments[1];
                    _callback = arguments[2];
                    _errorCallback = arguments[3];
            }

            var fileExt = getFileExt(_src);
            var req = new XMLHttpRequest();

            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        if (fileExt === 'json') {
                            _callback(_id, JSON.parse(req.responseText));
                        }
                        else {
                            _callback(_id, req.responseText);
                        }
                    }
                    else {
                        _errorCallback(_src);
                    }
                }
            };

            req.open('GET', _src, true);
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

            for (var i = 0; i < totalCount; i++) {
                /* jshint loopfunc:true */
                (function (index) {
                    setTimeout(function () {
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
                            if (util.getType(resourceSrc) === 'array') {
                                /* jshint nonew: false */
                                (function (rId, r) {
                                    var howlOpts = {
                                        urls: resourceSrc,
                                        onload: function () {
                                            loadOneCallback(rId, this);
                                        },
                                        onloaderror: function () {
                                            errorCallback(this._src);
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
                        }
                        else {
                            loadOneCallback(resourceId, me.asset[resourceId]);
                        }
                    }, (index + 1) * 300);
                })(i);
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
        var segments = fileName.split('.');
        return segments[segments.length - 1].toLowerCase();
    }

    return ResourceLoader;

    /**
     * 模块导出对象
     * resources, loadOther, loadImage, loadResource 同时挂载在 ig 和 exports 上
     * 挂载在 ig 上为了方便全局调用，挂载在 exports 上是为了内部模块直接引用 resourceLoader 模块
     *
     * @type {Object}
     */
    // var exports = {};

    // *
    //  * 缓存已经 load 成功的资源
    //  *
    //  * @type {Object}

    // ig.resources = exports.resources = {};


    // return exports;
});
