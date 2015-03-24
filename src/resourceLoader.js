/**
 * @file 资源加载
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var ig = require('./ig');
    var util = require('./util');

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

    /**
     * 缓存已经 load 成功的资源
     *
     * @type {Object}
     */
    ig.resources = {};

    /**
     * 模块到处对象
     *
     * @type {Object}
     */
    var exports = {};

    /**
     * 加载其他资源
     *
     * @param {string} id 图片 id
     * @param {string} src 图片路径
     * @param {Function} callback 加载成功回调
     * @param {Function} errorCallback 加载失败回调
     */
    exports.loadOther = function (id, src, callback, errorCallback) {
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
    };

    /**
     * 加载图片
     *
     * @param {string} id 图片 id
     * @param {string} src 图片路径
     * @param {Function} callback 加载成功回调
     * @param {Function} errorCallback 加载失败回调
     */
    exports.loadImage = function (id, src, callback, errorCallback) {
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
    };

    /**
     * 加载资源
     *
     * @param {Array | string} resource 资源
     * @param {Function} callback 全部加载完成回调
     * @param {Object} opts 参数配置
     * @param {Function} opts.processCallback 加载每一项完成的回调
     * @param {Objecy} opts.customResourceTypes 自定义的资源配置，opts.customResourceTypes = {'bmp': 'Image'}
     *
     */
    exports.load = function (resource, callback, opts) {
        var me = this;
        opts = opts || {};

        if (!Array.isArray(resource)) {
            resource = [resource];
        }

        var loadError = false;

        var errorCallback = function (item) {
            loadError = true;
            (opts.errorCallback || function (errItem) {
                throw ('Loading Error: ' + errItem);
            }).call(me, item);
        };

        var processCallback = opts.processCallback || util.noop;
        var totalCount = resource.length;
        var remainingCount = totalCount;

        var loadOneCallback = function (id, obj) {
            if (loadError) {
                return;
            }

            if (!ig.resources[id]) {
                ig.resources[id] = obj;
            }

            remainingCount--;

            processCallback(totalCount - remainingCount, totalCount);

            if (remainingCount === 0 && callback) {
                callback.apply(me);
            }
        };

        var customResourceTypes = opts.customResourceTypes || {};
        var resourceTypes = util.extend({}, defaultResourceTypes, customResourceTypes);

        for (var i = 0; i < totalCount; i++) {
            var curResource = resource[i];
            var resourceId;
            var resourceSrc;
            if (util.getType(curResource) === 'object') {
                resourceId = curResource.id;
                resourceSrc = curResource.src;
            }
            else {
                resourceId = resourceSrc = curResource;
            }

            var invokeMethod = me['load' + resourceTypes[getFileExt(resourceSrc)]];
            if (!invokeMethod) {
                invokeMethod = me.loadOther;
            }

            invokeMethod(
                resourceId, resourceSrc, loadOneCallback, errorCallback
            );

        }

    };

    return exports;

});
