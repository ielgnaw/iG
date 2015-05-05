/**
 * @file 资源加载
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    // TODO: load Audio/WebAudio

    var ig = require('./ig');
    var util = require('./util');
    var env = require('./env');

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

    // test
    // env.ogg = false;
    // env.mp3 = false;
    // env.wav = false;

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
     * 模块导出对象
     * resources, loadOther, loadImage, loadResource 同时挂载在 ig 和 exports 上
     * 挂载在 ig 上为了方便全局调用，挂载在 exports 上是为了内部模块直接引用 resourceLoader 模块
     *
     * @type {Object}
     */
    var exports = {};

    /**
     * 缓存已经 load 成功的资源
     *
     * @type {Object}
     */
    ig.resources = exports.resources = {};

    ig.resourcesExtname = exports.resourcesExtname = [];

    /**
     * 加载其他资源
     *
     * @param {string} id 图片 id
     * @param {string} src 图片路径
     * @param {Function} callback 加载成功回调
     * @param {Function} errorCallback 加载失败回调
     */
    ig.loadOther = exports.loadOther = function (id, src, callback, errorCallback) {
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
    ig.loadImage = exports.loadImage = function (id, src, callback, errorCallback) {
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
     * 加载资源，资源格式为: {id: 'xxxx', src: 'path'} 或 'path'
     *
     * @param {Array | string} resource 资源
     * @param {Function} callback 全部加载完成回调
     * @param {Object} opts 参数配置
     * @param {Function} opts.processCallback 加载每一项完成的回调
     * @param {Object} opts.customResourceTypes 自定义的资源配置，opts.customResourceTypes = {'bmp': 'Image'}
     */
    ig.loadResource = exports.loadResource = function (resource, callback, opts) {
        var me = this;
        opts = opts || {};

        if (!Array.isArray(resource)) {
            resource = [resource];
        }

        var loadError = false;

        var errorCallback = function (item) {
            loadError = true;
            (opts.errorCallback || function (errItem) {
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

            if (!ig.resources[id]) {
                ig.resources[id] = obj;
            }

            remainingCount--;

            processCallback(totalCount - remainingCount, totalCount);

            if (remainingCount === 0 && callback) {
                // console.warn(ig.resources);
                // console.warn(ig.resourcesExtname);
                if (!checkAllAudioSupport()) {
                    throw new Error('All audio\'s type is not supported');
                }
                callback.call(me, ig.resources);
            }
        };

        var customResourceTypes = opts.customResourceTypes || {};
        var resourceTypes = util.extend({}, defaultResourceTypes, customResourceTypes);

        for (var i = 0; i < totalCount; i++) {
            var curResource = resource[i];
            var resourceType = '';
            var extName;
            var resourceId;
            var resourceSrc;
            if (util.getType(curResource) === 'object') {
                resourceId = curResource.id;
                resourceSrc = curResource.src;
            }
            else {
                resourceId = resourceSrc = curResource;
            }

            if (!ig.resources.hasOwnProperty(resourceId)) {
                extName = getFileExt(resourceSrc);
                resourceType = resourceTypes[extName];
                ig.resourcesExtname.push({
                    src: resourceSrc,
                    extName: extName,
                    resourceType: resourceType
                });

                var invokeMethod = me['load' + resourceType];
                if (!invokeMethod) {
                    invokeMethod = me.loadOther;
                }

                invokeMethod(
                    resourceId, resourceSrc, loadOneCallback, errorCallback
                );
            }
            else {
                loadOneCallback(resourceId, ig.resources[resourceId]);
            }
        }
    };

    /**
     * 加载 audio
     *
     * @param {string} id audio id
     * @param {string} src audio 路径
     * @param {Function} callback 加载成功回调
     * @param {Function} errorCallback 加载失败回调
     */
    ig.loadAudio = exports.loadAudio = function (id, src, callback, errorCallback) {
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

        // var fileExt = getFileExt(_src);
        // console.warn(env);
        // console.warn(fileExt);
        // console.log(_id,_src,_callback, _errorCallback);
        // 设备支持 webAudio
        if (env.webAudio) {
            loadWebAudio(_id, _src, _callback, _errorCallback);
        }
        // alert(''
        //     + ' audioData: ' + env.audioData
        //     + ', webAudio: ' + env.webAudio
        //     + ', m4a: ' + env.m4a
        //     + ', mp3: ' + env.mp3
        //     + ', ogg: ' + env.ogg
        //     + ', opus: ' + env.opus
        //     + ', wav: ' + env.wav
        //     + ', webm: ' + env.webm);
    };

    /**
     * 加载 webAudio
     *
     * @param {string} id audio id
     * @param {string} src audio 路径
     * @param {Function} callback 加载成功回调
     * @param {Function} errorCallback 加载失败回调
     */
    function loadWebAudio(id, src, callback, errorCallback) {
        var req = new XMLHttpRequest();
        req.open('GET', src, true);
        req.responseType = 'arraybuffer';
        req.onload = function () {
            var audioData = req.response;

            ig.audioContext.decodeAudioData(
                audioData,
                function (buffer) {
                    callback(id, buffer);
                },
                function () {
                    console.warn(id, src, callback, errorCallback);
                    ig.loadOther(id, src, callback, errorCallback);
                    // errorCallback(src);
                }
            );
        };

        req.send(null);
    }

    /**
     * 检测当前传入的资源里，是否所有的 audio 都不支持
     * 只要有一个支持就行，如果都不支持，那么在 load 完毕后会 throw Error
     *
     * @return {boolean} 是否有一个支持
     */
    function checkAllAudioSupport() {
        for (var i = 0, len = ig.resourcesExtname.length; i < len; i++) {
            var cur = ig.resourcesExtname[i];
            if (cur.resourceType.toLowerCase() === 'audio') {
                if (env[cur.extName]) {
                    return true;
                }
            }
        }
        return false;
    }

    return exports;
});
