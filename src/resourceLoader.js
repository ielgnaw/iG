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

        req.onerror = function() {
            alert('loadOther: XHR error');
            throw new Error('loadOther: XHR error');
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

            if (!exports.resources[id]) {
                exports.resources[id] = obj;
            }

            remainingCount--;

            processCallback(totalCount - remainingCount, totalCount);

            if (remainingCount === 0 && callback) {
                callback.call(me, exports.resources);
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

            if (!exports.resources.hasOwnProperty(resourceId)) {

                // 是数组说明是音频资源
                if (util.getType(resourceSrc) === 'array') {
                    exports.loadAudio(resourceId, resourceSrc, loadOneCallback, errorCallback);
                }
                else {
                    extName = getFileExt(resourceSrc);
                    resourceType = resourceTypes[extName];
                    exports.resourcesExtname.push({
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
            }
            else {
                loadOneCallback(resourceId, exports.resources[resourceId]);
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

        if (env.webAudio) {
            loadWebAudio(_id, _src, _callback, _errorCallback);
        }
        else {
            loadAudio(_id, _src, _callback, _errorCallback);
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
     * 加载 audio，传入的资源是一个数组，只要有一个加载成功即可
     *
     * @param {string} id audio id
     * @param {Array} src audio 路径
     * @param {Function} callback 加载成功回调
     * @param {Function} errorCallback 加载失败回调
     */
    function loadAudio(id, src, callback, errorCallback) {
        if (!document.createElement('audio').play) {
            callback(id, null);
            return;
        }

        var length = src.length;
        var isAllNotSupported = true;
        for (var i = 0; i < length; i++) {
            var extName = getFileExt(src[i]);
            if (env[extName]) {
                loadHTML5Audio(id, src[i], callback, errorCallback, isAllNotSupported);
                isAllNotSupported = false;
            }
        }
    }

    /**
     * 加载 audio
     *
     * @param {string} id audio id
     * @param {Array} src audio 路径
     * @param {Function} callback 加载成功回调
     * @param {Function} errorCallback 加载失败回调
     * @param {boolean} isAllNotSupported 是否全部不支持，如果是的话，那么就加载下一个
     */
    function loadHTML5Audio(id, src, callback, errorCallback, isAllNotSupported) {
        if (isAllNotSupported) {
            var aud = new Audio();
            aud.addEventListener('error', errorCallback);
            aud.addEventListener('canplaythrough', function () {
                callback(id, aud);
            });
            aud.src = src;
            aud.load();

            callback(id, aud);
        }
    }

    /**
     * 加载 webAudio，传入的资源是一个数组，只要有一个加载成功即可
     *
     * @param {string} id audio id
     * @param {Array} src audio 路径
     * @param {Function} callback 加载成功回调
     * @param {Function} errorCallback 加载失败回调
     */
    function loadWebAudio(id, src, callback, errorCallback) {
        var length = src.length;
        var isAllNotSupported = true;
        for (var i = 0; i < length; i++) {
            var extName = getFileExt(src[i]);
            if (env[extName]) {
                isAllNotSupported = false;
                loadBuffer(id, src[i], callback, errorCallback);
            }
        }

        if (isAllNotSupported) {
            alert('All Audio\'s types are not supported on your resources id: ' + id);
            throw new Error('All Audio\'s types are not supported on your resources id: ' + id);
        }
    }

    /**
     * 加载 webAudio 的 buffer
     * 设置音频的资源一般这样设置：
     * {id: 'sound1', src: ['./data/a1.ogg', './data/a1.wav', './data/a1.mp3']}
     * 这里的判断原则是只会去加载平台支持的文件，例如 ios 只会去加载 wav 和 mp3
     * 同时由于设置音频的时候，src 数组中的音频文件内容都是一样的，只是格式不一样，因此这里加载的时候，
     * 请求还是会发送多个，但是只要有一个文件加载完毕（通常是 size 小的文件）那么就触发加载完毕的函数了，
     * 不需要等到所有能加载的资源全部 onload 后
     * 例如上面的例子，ogg 格式无法加载，mp3 的 size 比 wav 小，因此当 mp3 加载完毕后就会触发 callback
     *
     * @param {string} id audio id
     * @param {string} src audio 路径
     * @param {Function} callback 加载成功回调
     * @param {Function} errorCallback 加载失败回调
     */
    function loadBuffer(id, src, callback, errorCallback) {
        var req = new XMLHttpRequest();

        req.onload = function () {
            ig.audioContext.decodeAudioData(
                req.response,
                function (buffer) {
                    if (!buffer) {
                        errorCallback(src);
                        return;
                    }
                    callback(id, buffer);
                },
                function (error) {
                    errorCallback(src);
                }
            );
        };

        req.onerror = function() {
            alert('loadBuffer: XHR error');
            throw new Error('loadBuffer: XHR error');
        };

        req.open('GET', src, true);
        req.responseType = 'arraybuffer';
        req.send(null);
    }

    /**
     * 检测当前传入的资源里，是否所有的 audio 都不支持
     * 只要有一个支持就行，如果都不支持，那么在 load 完毕后会 throw Error
     *
     * @return {boolean} 是否有一个支持
     */
    // function checkAllAudioSupport() {
    //     for (var i = 0, len = ig.resourcesExtname.length; i < len; i++) {
    //         var cur = ig.resourcesExtname[i];
    //         if (cur.resourceType.toLowerCase() === 'audio') {
    //             if (env[cur.extName]) {
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    return exports;
});
