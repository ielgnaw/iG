(function(_global){
var require, define;
(function () {
    var mods = {};

    define = function (id, deps, factory) {
        mods[id] = {
            id: id,
            deps: deps,
            factory: factory,
            defined: 0,
            exports: {},
            require: createRequire(id)
        };
    };

    require = createRequire('');

    function normalize(id, baseId) {
        if (!baseId) {
            return id;
        }

        if (id.indexOf('.') === 0) {
            var basePath = baseId.split('/');
            var namePath = id.split('/');
            var baseLen = basePath.length - 1;
            var nameLen = namePath.length;
            var cutBaseTerms = 0;
            var cutNameTerms = 0;

            pathLoop: for (var i = 0; i < nameLen; i++) {
                switch (namePath[i]) {
                    case '..':
                        if (cutBaseTerms < baseLen) {
                            cutBaseTerms++;
                            cutNameTerms++;
                        }
                        else {
                            break pathLoop;
                        }
                        break;
                    case '.':
                        cutNameTerms++;
                        break;
                    default:
                        break pathLoop;
                }
            }

            basePath.length = baseLen - cutBaseTerms;
            namePath = namePath.slice(cutNameTerms);

            return basePath.concat(namePath).join('/');
        }

        return id;
    }

    function createRequire(baseId) {
        var cacheMods = {};

        function localRequire(id, callback) {
            if (typeof id === 'string') {
                var exports = cacheMods[id];
                if (!exports) {
                    exports = getModExports(normalize(id, baseId));
                    cacheMods[id] = exports;
                }

                return exports;
            }
            else if (id instanceof Array) {
                callback = callback || function () {};
                callback.apply(this, getModsExports(id, callback, baseId));
            }
        };

        return localRequire;
    }

    function getModsExports(ids, factory, baseId) {
        var es = [];
        var mod = mods[baseId];

        for (var i = 0, l = Math.min(ids.length, factory.length); i < l; i++) {
            var id = normalize(ids[i], baseId);
            var arg;
            switch (id) {
                case 'require':
                    arg = (mod && mod.require) || require;
                    break;
                case 'exports':
                    arg = mod.exports;
                    break;
                case 'module':
                    arg = mod;
                    break;
                default:
                    arg = getModExports(id);
            }
            es.push(arg);
        }

        return es;
    }

    function getModExports(id) {
        var mod = mods[id];
        if (!mod) {
            throw new Error('No ' + id);
        }

        if (!mod.defined) {
            var factory = mod.factory;
            var factoryReturn = factory.apply(
                this,
                getModsExports(mod.deps || [], factory, id)
            );
            if (typeof factoryReturn !== 'undefined') {
                mod.exports = factoryReturn;
            }
            mod.defined = 1;
        }

        return mod.exports;
    }
}());
define('ig', ['ig/ig'], function (main) {return main;});
define('ig/ig', ['require'], function (require) {
    'use strict';
    window.requestAnimationFrame = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function (callback, elem) {
            var me = this;
            var start;
            var finish;
            setTimeout(function () {
                start = +new Date();
                callback(start);
                finish = +new Date();
                me.timeout = 1000 / 60 - (finish - start);
            }, me.timeout);
        };
    }();
    window.cancelAnimationFrame = function () {
        return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame || window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame || window.clearTimeout;
    }();
    var exports = {};
    return exports;
});define('ig/util', ['require'], function (require) {
    'use strict';
    var DEG2RAD_OPERAND = Math.PI / 180;
    var RAD2DEG_OPERAND = 180 / Math.PI;
    var objectProto = Object.prototype;
    var exports = {};
    exports.noop = function () {
    };
    exports.extend = function (target, source) {
        for (var i = 1, len = arguments.length; i < len; i++) {
            source = arguments[i];
            if (!source) {
                continue;
            }
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
    exports.inherits = function (subClass, superClass) {
        var Empty = function () {
        };
        Empty.prototype = superClass.prototype;
        var selfPrototype = subClass.prototype;
        var proto = subClass.prototype = new Empty();
        for (var key in selfPrototype) {
            proto[key] = selfPrototype[key];
        }
        subClass.prototype.constructor = subClass;
        subClass.superClass = superClass.prototype;
        return subClass;
    };
    exports.deg2Rad = function (deg) {
        return deg * DEG2RAD_OPERAND;
    };
    exports.rad2Deg = function (rad) {
        return rad * RAD2DEG_OPERAND;
    };
    exports.window2Canvas = function (canvas, x, y) {
        var boundRect = canvas.getBoundingClientRect();
        return {
            x: Math.round(x - boundRect.left * (canvas.width / boundRect.width)),
            y: Math.round(y - boundRect.top * (canvas.height / boundRect.height))
        };
    };
    exports.fastApply = function (func, thisContext, args) {
        switch (args.length) {
        case 0:
            return func.call(thisContext);
        case 1:
            return func.call(thisContext, args[0]);
        case 2:
            return func.call(thisContext, args[0], args[1]);
        case 3:
            return func.call(thisContext, args[0], args[1], args[2]);
        case 4:
            return func.call(thisContext, args[0], args[1], args[2], args[3]);
        case 5:
            return func.call(thisContext, args[0], args[1], args[2], args[3], args[4]);
        case 6:
            return func.call(thisContext, args[0], args[1], args[2], args[3], args[4], args[5]);
        case 7:
            return func.call(thisContext, args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
        case 8:
            return func.call(thisContext, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
        case 9:
            return func.call(thisContext, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
        default:
            return func.apply(thisContext, args);
        }
    };
    exports.removeArrByCondition = function (list, callback) {
        var candidateIndex = -1;
        var tmp;
        for (var i = 0, len = list.length; i < len; i++) {
            tmp = list[i];
            if (callback(tmp)) {
                candidateIndex = i;
                break;
            }
        }
        if (candidateIndex !== -1) {
            list.splice(candidateIndex, 1);
        }
    };
    exports.parseColor = function (color, toNumber) {
        if (toNumber === true) {
            if (typeof color === 'number') {
                return color | 0;
            }
            if (typeof color === 'string' && color[0] === '#') {
                color = color.slice(1);
            }
            return parseInt(color, 16);
        } else {
            if (typeof color === 'number') {
                color = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
            }
            return color;
        }
    };
    exports.colorToRGB = function (color, alpha) {
        if (typeof color === 'string' && color[0] === '#') {
            color = window.parseInt(color.slice(1), 16);
        }
        alpha = alpha === undefined ? 1 : alpha;
        var r = color >> 16 & 255;
        var g = color >> 8 & 255;
        var b = color & 255;
        var a = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
        if (a === 1) {
            return 'rgb(' + r + ',' + g + ',' + b + ')';
        } else {
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        }
    };
    exports.randomInt = function (min, max) {
        return Math.floor(Math.random() * max + min);
    };
    exports.randomFloat = function (min, max) {
        return Math.random() * (max - min) + min;
    };
    exports.domWrap = function (curNode, newNode, newNodeId) {
        curNode.parentNode.insertBefore(newNode, curNode);
        newNode.appendChild(curNode);
        newNode.id = newNodeId;
        return curNode;
    };
    exports.getType = function (obj) {
        var objectName = objectProto.toString.call(obj);
        var match = /\[object (\w+)\]/.exec(objectName);
        return match[1].toLowerCase();
    };
    exports.windowToCanvas = function (canvas, x, y) {
        var boundRect = canvas.getBoundingClientRect();
        var width = canvas.width;
        var height = canvas.height;
        return {
            x: Math.round(x - boundRect.left * (width / boundRect.width)),
            y: Math.round(y - boundRect.top * (height / boundRect.height))
        };
    };
    exports.getMouseCoords = function (canvas, event) {
        var boundRect = canvas.getBoundingClientRect();
        var top = boundRect.top;
        var bottom = boundRect.bottom;
        var left = boundRect.left;
        var right = boundRect.right;
        var styles = getComputedStyle(canvas, null);
        if (styles) {
            var topBorder = parseInt(styles.getPropertyValue('border-top-width'), 10);
            var rightBorder = parseInt(styles.getPropertyValue('border-right-width'), 10);
            var bottomBorder = parseInt(styles.getPropertyValue('border-bottom-width'), 10);
            var leftBorder = parseInt(styles.getPropertyValue('border-left-width'), 10);
            left += leftBorder;
            right -= rightBorder;
            top += topBorder;
            bottom -= bottomBorder;
        }
        var ret = {};
        ret.x = event.clientX - left;
        ret.y = event.clientY - top;
        var width = right - left;
        if (canvas.width !== width) {
            var height = bottom - top;
            ret.x = ret.x * (canvas.width / width);
            ret.y = ret.y * (canvas.height / height);
        }
        return ret;
    };
    exports.captureMouse = function (element) {
        var ret = {
            x: 0,
            y: 0,
            event: null
        };
        var bodyScrollLeft = document.body.scrollLeft;
        var docElementScrollLeft = document.documentElement.scrollLeft;
        var bodyScrollTop = document.body.scrollTop;
        var docElementScrollTop = document.documentElement.scrollTop;
        var offsetLeft = element.offsetLeft;
        var offsetTop = element.offsetTop;
        element.addEventListener('mousemove', function (event) {
            var x;
            var y;
            if (event.pageX || event.pageY) {
                x = event.pageX;
                y = event.pageY;
            } else {
                x = event.clientX + bodyScrollLeft + docElementScrollLeft;
                y = event.clientY + bodyScrollTop + docElementScrollTop;
            }
            x -= offsetLeft;
            y -= offsetTop;
            ret.x = x;
            ret.y = y;
            ret.event = event;
            console.warn(ret);
        }, false);
        return ret;
    };
    exports.captureTouch = function (element) {
        var touch = {
            x: null,
            y: null,
            isPressed: false,
            event: null
        };
        var bodyScrollLeft = document.body.scrollLeft;
        var docElementScrollLeft = document.documentElement.scrollLeft;
        var bodyScrollTop = document.body.scrollTop;
        var docElementScrollTop = document.documentElement.scrollTop;
        var offsetLeft = element.offsetLeft;
        var offsetTop = element.offsetTop;
        element.addEventListener('touchstart', function (event) {
            touch.isPressed = true;
            touch.event = event;
            console.warn(touch, 'touchstart');
        }, false);
        element.addEventListener('touchend', function (event) {
            touch.isPressed = false;
            touch.x = null;
            touch.y = null;
            touch.event = event;
            console.warn(touch, 'touchend');
        }, false);
        element.addEventListener('touchmove', function (event) {
            var x;
            var y;
            var touchEvent = event.touches[0];
            if (touchEvent.pageX || touchEvent.pageY) {
                x = touchEvent.pageX;
                y = touchEvent.pageY;
            } else {
                x = touchEvent.clientX + bodyScrollLeft + docElementScrollLeft;
                y = touchEvent.clientY + bodyScrollTop + docElementScrollTop;
            }
            x -= offsetLeft;
            y -= offsetTop;
            touch.x = x;
            touch.y = y;
            touch.event = event;
            console.log(exports.getMouseCoords(touch.event.target, touchEvent));
        }, false);
        return touch;
    };
    return exports;
});define('ig/Event', ['require'], function (require) {
    'use strict';
    var guidKey = '_observerGUID';
    function Event() {
        this._events = {};
    }
    Event.prototype = {
        constructor: Event,
        on: function (type, handler) {
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
        },
        un: function (type, handler) {
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
                        i--;
                    }
                }
            }
            return this;
        },
        fire: function (type, event) {
            if (arguments.length === 1 && typeof type === 'object') {
                event = type;
                type = event.type;
            }
            var inlineHandler = this['on' + type];
            if (typeof inlineHandler === 'function') {
                inlineHandler.call(this, event);
            }
            if (!this._events) {
                return;
            }
            if (event == null) {
                event = {};
            }
            if (Object.prototype.toString.call(event) !== '[object Object]') {
                event = { data: event };
            }
            event.type = type;
            event.target = this;
            var alreadyInvoked = {};
            var pool = this._events[type];
            if (pool) {
                pool = pool.slice();
                for (var i = 0; i < pool.length; i++) {
                    var handler = pool[i];
                    if (!alreadyInvoked.hasOwnProperty(handler[guidKey])) {
                        handler.call(this, event);
                    }
                }
            }
            if (type !== '*') {
                var allPool = this._events['*'];
                if (!allPool) {
                    return;
                }
                allPool = allPool.slice();
                for (var i = 0; i < allPool.length; i++) {
                    var handler = allPool[i];
                    if (!alreadyInvoked.hasOwnProperty(handler[guidKey])) {
                        handler.call(this, event);
                    }
                }
            }
        },
        enable: function (target) {
            target._events = {};
            target.on = Event.prototype.on;
            target.un = Event.prototype.un;
            target.fire = Event.prototype.fire;
        }
    };
    return Event;
});define('ig/env', ['require'], function (require) {
    'use strict';
    function detect(ua) {
        var os = {};
        var browser = {};
        var webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/);
        var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        var osx = !!ua.match(/\(Macintosh\; Intel /);
        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
        var webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/);
        var wp = ua.match(/Windows Phone ([\d.]+)/);
        var touchpad = webos && ua.match(/TouchPad/);
        var kindle = ua.match(/Kindle\/([\d.]+)/);
        var silk = ua.match(/Silk\/([\d._]+)/);
        var blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/);
        var bb10 = ua.match(/(BB10).*Version\/([\d.]+)/);
        var rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/);
        var playbook = ua.match(/PlayBook/);
        var chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/);
        var firefox = ua.match(/Firefox\/([\d.]+)/);
        var ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/);
        var webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/);
        var safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/);
        var wechat = ua.match(/MicroMessenger\/([\d.]+)/);
        var baidu = ua.match(/baiduboxapp\/[^\/]+\/([\d.]+)_/) || ua.match(/baiduboxapp\/([\d.]+)/) || ua.match(/BaiduHD\/([\d.]+)/) || ua.match(/FlyFlow\/([\d.]+)/) || ua.match(/baidubrowser\/([\d.]+)/);
        var qq = ua.match(/MQQBrowser\/([\d.]+)/) || ua.match(/QQ\/([\d.]+)/);
        var uc = ua.match(/UCBrowser\/([\d.]+)/);
        var sogou = ua.match(/SogouMobileBrowser\/([\d.]+)/);
        var xiaomi = android && ua.match(/MiuiBrowser\/([\d.]+)/);
        var liebao = ua.match(/LBKIT/);
        var mercury = ua.match(/Mercury\/([\d.]+)/);
        if (browser.webkit = !!webkit) {
            browser.version = webkit[1];
        }
        if (android) {
            os.android = true;
            os.version = android[2];
        }
        if (iphone && !ipod) {
            os.ios = os.iphone = true;
            os.version = iphone[2].replace(/_/g, '.');
        }
        if (ipad) {
            os.ios = os.ipad = true;
            os.version = ipad[2].replace(/_/g, '.');
        }
        if (ipod) {
            os.ios = os.ipod = true;
            os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        }
        if (wp) {
            os.wp = true;
            os.version = wp[1];
        }
        if (webos) {
            os.webos = true;
            os.version = webos[2];
        }
        if (touchpad) {
            os.touchpad = true;
        }
        if (blackberry) {
            os.blackberry = true;
            os.version = blackberry[2];
        }
        if (bb10) {
            os.bb10 = true;
            os.version = bb10[2];
        }
        if (rimtabletos) {
            os.rimtabletos = true;
            os.version = rimtabletos[2];
        }
        if (playbook) {
            browser.playbook = true;
        }
        if (kindle) {
            os.kindle = true;
            os.version = kindle[1];
        }
        if (silk) {
            browser.silk = true;
            browser.version = silk[1];
        }
        if (!silk && os.android && ua.match(/Kindle Fire/)) {
            browser.silk = true;
        }
        if (chrome) {
            browser.chrome = true;
            browser.version = chrome[1];
        }
        if (firefox) {
            browser.firefox = true;
            browser.version = firefox[1];
        }
        if (ie) {
            browser.ie = true;
            browser.version = ie[1];
        }
        if (safari && (osx || os.ios)) {
            browser.safari = true;
            if (osx) {
                browser.version = safari[1];
            }
        }
        if (webview) {
            browser.webview = true;
        }
        if (wechat) {
            browser.wechat = true;
            browser.version = wechat[1];
        }
        if (baidu) {
            delete browser.webview;
            browser.baidu = true;
            browser.version = baidu[1];
        }
        if (qq) {
            browser.qq = true;
            browser.version = qq[1];
        }
        if (uc) {
            delete browser.webview;
            browser.uc = true;
            browser.version = uc[1];
        }
        if (sogou) {
            delete browser.webview;
            browser.sogou = true;
            browser.version = sogou[1];
        }
        if (xiaomi) {
            browser.xiaomi = true;
            browser.version = xiaomi[1];
        }
        if (liebao) {
            browser.liebao = true;
            browser.version = '0';
        }
        if (mercury) {
            browser.mercury = true;
            browser.version = mercury[1];
        }
        if (navigator.standalone) {
            browser.standalone = true;
        }
        os.tablet = !!(ipad || playbook || android && !ua.match(/Mobile/) || firefox && ua.match(/Tablet/) || ie && !ua.match(/Phone/) && ua.match(/Touch/));
        os.phone = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 || chrome && ua.match(/Android/) || chrome && ua.match(/CriOS\/([\d.]+)/) || firefox && ua.match(/Mobile/) || ie && ua.match(/Touch/)));
        return {
            browser: browser,
            os: os
        };
    }
    function checkAudio(exp) {
        exp.audioData = !!window.Audio;
        exp.webAudio = !!(window.AudioContext || window.webkitAudioContext);
        var audioElement = document.createElement('audio');
        var result = false;
        try {
            if (result = !!audioElement.canPlayType) {
                if (audioElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')) {
                    exp.ogg = true;
                }
                if (audioElement.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '') || audioElement.canPlayType('audio/opus;').replace(/^no$/, '')) {
                    exp.opus = true;
                }
                if (audioElement.canPlayType('audio/mpeg;').replace(/^no$/, '')) {
                    exp.mp3 = true;
                }
                if (audioElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '')) {
                    exp.wav = true;
                }
                if (audioElement.canPlayType('audio/x-m4a;') || audioElement.canPlayType('audio/aac;').replace(/^no$/, '')) {
                    exp.m4a = true;
                }
                if (audioElement.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')) {
                    exp.webm = true;
                }
            }
        } catch (e) {
        }
    }
    var env = detect(navigator.userAgent);
    var exports = {
        browser: env.browser,
        os: env.os,
        supportOrientation: typeof window.orientation == 'number' && typeof window.onorientationchange == 'object',
        supportTouch: 'ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch,
        supportGeolocation: navigator.geolocation != null,
        isAndroid: env.os.android,
        isIOS: env.os.ios,
        isPhone: env.os.phone,
        isTablet: env.os.tablet,
        isMobile: env.os.phone || env.os.tablet
    };
    checkAudio(exports);
    return exports;
});define('ig/ImageLoader', [
    'require',
    './Event',
    './util'
], function (require) {
    'use strict';
    var Event = require('./Event');
    var util = require('./util');
    var arrayProto = Array.prototype;
    function ImageLoader(opts) {
        Event.apply(this, arguments);
        opts = opts || {};
        var source = opts.source || [];
        Array.isArray(source) ? this.source = source : this.source = [source];
        this.allCallback = opts.allCallback || util.noop;
        this.imagesLoadedCount = 0;
        this.imagesErrorLoadedCount = 0;
        this.images = {};
        this.imageList = [];
    }
    ImageLoader.prototype = {
        constructor: ImageLoader,
        addImages: function (source) {
            var me = this;
            arrayProto.push[Array.isArray(source) ? 'apply' : 'call'](me.source, source);
        },
        load: function () {
            var me = this;
            var len = me.source.length;
            for (var i = 0; i < len; i++) {
                var tmp = me.source[i];
                var imgId;
                var imgSrc;
                if (util.getType(tmp) === 'object') {
                    imgId = tmp.id;
                    imgSrc = tmp.src;
                } else {
                    imgId = imgSrc = tmp;
                }
                me.images[imgId] = new Image();
                me.imageList.push(me.images[imgId]);
                me.images[imgId].addEventListener('load', function (e) {
                    me.imagesLoadedCount++;
                    me.fire('ImageLoader:imageLoaded', {
                        data: {
                            progress: (me.imagesLoadedCount + me.imagesErrorLoadedCount) / len * 100,
                            curImg: me.images[imgId]
                        }
                    });
                    if (me.imagesLoadedCount >= len) {
                        me.fire('ImageLoader:allImageLoaded', {
                            data: {
                                allCount: len,
                                imageList: me.imageList,
                                images: me.images
                            }
                        });
                        me.allCallback.call(me);
                    }
                });
                me.images[imgId].addEventListener('error', function (e) {
                    me.imagesErrorLoadedCount++;
                    me.fire('ImageLoader:imageLoadedError', {
                        data: {
                            progress: (me.imagesLoadedCount + me.imagesErrorLoadedCount) / len * 100,
                            curImg: me.images[imgId]
                        }
                    });
                });
                me.images[imgId].src = imgSrc;
            }
        }
    };
    util.inherits(ImageLoader, Event);
    return ImageLoader;
});define('ig/Game', [
    'require',
    './Event',
    './util',
    './Stage'
], function (require) {
    'use strict';
    var Event = require('./Event');
    var util = require('./util');
    var Stage = require('./Stage');
    var _guid = 0;
    var _defaultFPS = 60;
    var _now;
    var _startTime;
    var _interval;
    var _delta;
    var _realFpsStart;
    var _realFps;
    var _realDelta;
    function Game(opts) {
        opts = opts || {};
        Event.apply(this, arguments);
        this.name = opts.name === null || opts.name === void 0 ? 'ig_game_' + _guid++ : opts.name;
        this.paused = false;
        this.stageStack = [];
        this.stages = {};
        _defaultFPS = opts.fps || 60;
    }
    Game.prototype = {
        constructor: Game,
        start: function (startCallback) {
            var me = this;
            me.paused = false;
            _startTime = Date.now();
            _now = 0;
            _interval = 1000 / _defaultFPS;
            _delta = 0;
            _realFpsStart = Date.now();
            _realFps = 0;
            _realDelta = 0;
            me.requestID = window.requestAnimationFrame(function () {
                me.render.call(me);
            });
            util.getType(startCallback) === 'function' && startCallback.call(me, {
                data: {
                    startTime: _startTime,
                    interval: _interval
                }
            });
            return me;
        },
        render: function () {
            var me = this;
            me.requestID = window.requestAnimationFrame(function (context) {
                return function () {
                    context.render.call(context);
                };
            }(me));
            if (!me.paused) {
                _now = Date.now();
                _delta = _now - _startTime;
                if (_delta > _interval) {
                    _startTime = _now - _delta % _interval;
                    me.fire('beforeGameRender', { data: { startTime: _startTime } });
                    var curStage = me.getCurrentStage();
                    if (curStage) {
                        curStage.update();
                        curStage.render();
                    }
                    me.fire('afterGameRender', { data: { startTime: _startTime } });
                }
                if (_realDelta > 1000) {
                    _realFpsStart = Date.now();
                    _realDelta = 0;
                    me.fire('gameFPS', { data: { fps: _realFps } });
                    _realFps = 0;
                } else {
                    _realDelta = Date.now() - _realFpsStart;
                    ++_realFps;
                }
            }
        },
        pause: function () {
            this.paused = true;
            return this;
        },
        resume: function () {
            this.paused = false;
            return this;
        },
        stop: function () {
            window.cancelAnimationFrame(this.requestID);
            return this;
        },
        getStageStack: function () {
            return this.stageStack;
        },
        getStageByName: function (name) {
            return this.stages[name];
        },
        createStage: function (stageOpts) {
            var stage = new Stage(stageOpts);
            this.pushStage(stage);
            return stage;
        },
        pushStage: function (stage) {
            var me = this;
            if (!me.getStageByName(stage.name)) {
                stage.gameOwner = me;
                me.stageStack.push(stage);
                me.stages[stage.name] = stage;
                me.sortStageIndex();
            }
        },
        popStage: function () {
            var me = this;
            var stage = me.stageStack.pop();
            if (stage) {
                stage.clean();
                delete me.stages[stage.name];
                me.sortStageIndex();
            }
        },
        sortStageIndex: function () {
            var stageStack = this.stageStack;
            for (var i = 0, len = stageStack.length; i < len; i++) {
                stageStack[i].container.style.zIndex = i;
            }
        },
        removeStageByName: function (name) {
            var me = this;
            var st = me.getStageByName(name);
            if (st) {
                st.clean();
                delete me.stages[st.name];
                var stageStack = me.stageStack;
                util.removeArrByCondition(stageStack, function (s) {
                    return s.name === name;
                });
                me.sortStageIndex();
            }
        },
        swapStage: function (from, to) {
            var me = this;
            var stageStack = me.stageStack;
            var len = stageStack.length;
            if (from >= 0 && from <= len - 1 && to >= 0 && to <= len - 1) {
                var sc = stageStack[from];
                stageStack[from] = stageStack[to];
                stageStack[to] = sc;
                me.sortStageIndex();
            }
        },
        getStageIndex: function (stage) {
            return stage.container.style.zIndex;
        },
        getCurrentStage: function () {
            var me = this;
            return me.stageStack[me.stageStack.length - 1];
        },
        clearAllStage: function () {
            var me = this;
            for (var i = 0, len = me.stageStack.length; i < len; i++) {
                me.stageStack[i].clean();
            }
            me.stages = {};
            me.stageStack = [];
        }
    };
    util.inherits(Game, Event);
    return Game;
});define('ig/FrameMonitor', ['require'], function (require) {
    'use strict';
    function FrameMonitor() {
        this.max = 0;
        this.min = 9999;
        this.cur = 0;
        this.curTime = 0;
        this.expendPerFrame = 0;
        this.startTimePerSecond = 0;
        this.totalPerSecond = 0;
        this.totalSeconds = 0;
    }
    FrameMonitor.prototype = {
        constructor: FrameMonitor,
        reset: function () {
            var me = this;
            me.max = 0;
            me.min = 9999;
            me.cur = 0;
            me.curTime = 0;
            me.expendPerFrame = 0;
            me.startTimePerSecond = 0;
            me.totalPerSecond = 0;
        },
        start: function () {
            this.curTime = this.startTimePerSecond = Date.now();
        },
        update: function () {
            var now = Date.now();
            if (now - this.startTimePerSecond >= 1000) {
                this.cur = this.totalPerSecond;
                this.max = this.cur > this.max ? this.cur : this.max;
                this.min = this.cur < this.min ? this.cur : this.min;
                this.totalPerSecond = 0;
                this.startTimePerSecond = now;
                this.totalSeconds++;
                this.expendPerFrame = now - this.curTime;
                this.curTime = now;
            } else {
                ++this.totalPerSecond;
            }
        }
    };
    return FrameMonitor;
});define('ig/Stage', [
    'require',
    './Event',
    './util',
    './env',
    './DisplayObject'
], function (require) {
    'use strict';
    var Event = require('./Event');
    var util = require('./util');
    var env = require('./env');
    var DisplayObject = require('./DisplayObject');
    var guid = 0;
    var defaultCanvasWidth = 383;
    var defaultCanvasHeight = 550;
    function fitScreen(canvas, canvasParent) {
        var canvasX;
        var canvasY;
        var canvasScaleX;
        var canvasScaleY;
        var innerWidth = window.innerWidth;
        var innerHeight = window.innerHeight;
        if (innerWidth > 480) {
            innerWidth -= 1;
            innerHeight -= 1;
        }
        if (env.isMobile) {
            if (window.innerWidth > window.innerHeight) {
                if (innerWidth / canvas.width < innerHeight / canvas.height) {
                    canvas.style.width = innerWidth + 'px';
                    canvas.style.height = innerWidth / canvas.width * canvas.height + 'px';
                    canvasX = 0;
                    canvasY = (innerHeight - innerWidth / canvas.width * canvas.height) / 2;
                    canvasScaleX = canvasScaleY = canvas.width / innerWidth;
                    canvasParent.style.marginTop = canvasY + 'px';
                    canvasParent.style.marginLeft = canvasX + 'px';
                } else {
                    canvas.style.width = innerHeight / canvas.height * canvas.width + 'px';
                    canvas.style.height = innerHeight + 'px';
                    canvasX = (innerWidth - innerHeight / canvas.height * canvas.width) / 2;
                    canvasY = 0;
                    canvasScaleX = canvasScaleY = canvas.height / innerHeight;
                    canvasParent.style.marginTop = canvasY + 'px';
                    canvasParent.style.marginLeft = canvasX + 'px';
                }
            } else {
                canvasX = canvasY = 0;
                canvasScaleX = canvas.width / innerWidth;
                canvasScaleY = canvas.height / innerHeight;
                canvas.style.width = innerWidth + 'px';
                canvas.style.height = innerHeight + 'px';
                canvasParent.style.marginTop = '0px';
                canvasParent.style.marginLeft = '0px';
            }
        } else {
            if (innerWidth / canvas.width < innerHeight / canvas.height) {
                canvas.style.width = innerWidth + 'px';
                canvas.style.height = innerWidth / canvas.width * canvas.height + 'px';
                canvasX = 0;
                canvasY = (innerHeight - innerWidth / canvas.width * canvas.height) / 2;
                canvasScaleX = canvasScaleY = canvas.width / innerWidth;
                canvasParent.style.marginTop = canvasY + 'px';
                canvasParent.style.marginLeft = canvasX + 'px';
            } else {
                canvas.style.width = innerHeight / canvas.height * canvas.width + 'px';
                canvas.style.height = innerHeight + 'px';
                canvasX = (innerWidth - innerHeight / canvas.height * canvas.width) / 2;
                canvasY = 0;
                canvasScaleX = canvasScaleY = canvas.height / innerHeight;
                canvasParent.style.marginTop = canvasY + 'px';
                canvasParent.style.marginLeft = canvasX + 'px';
            }
        }
    }
    function initStage(canvas, stage) {
        canvas.width = defaultCanvasWidth;
        canvas.height = defaultCanvasHeight;
        var canvasParent = canvas.parentNode;
        fitScreen(canvas, canvasParent);
        window.addEventListener(env.supportOrientation ? 'orientationchange' : 'resize', function () {
            setTimeout(function () {
                fitScreen(canvas, canvasParent);
            }, 100);
        }, false);
    }
    function onTouchEvent(e) {
        console.warn(e.type, e);
    }
    function startupDomEvent(canvas) {
        canvas.addEventListener('touchstart', onTouchEvent, false);
        canvas.addEventListener('touchend', onTouchEvent, false);
        canvas.addEventListener('touchcancel', onTouchEvent, false);
        canvas.addEventListener('touchleave', onTouchEvent, false);
        canvas.addEventListener('touchmove', onTouchEvent, false);
    }
    function captureTouch(element) {
        var me = this;
        var touch = {
            x: null,
            y: null,
            isPressed: false,
            event: null
        };
        var bodyScrollLeft = document.body.scrollLeft;
        var docElementScrollLeft = document.documentElement.scrollLeft;
        var bodyScrollTop = document.body.scrollTop;
        var docElementScrollTop = document.documentElement.scrollTop;
        var offsetLeft = element.offsetLeft;
        var offsetTop = element.offsetTop;
        element.addEventListener('touchstart', function (event) {
            touch.isPressed = true;
            touch.event = event;
            console.warn(touch, 'touchstart');
        }, false);
        element.addEventListener('touchend', function (event) {
            touch.isPressed = false;
            touch.x = null;
            touch.y = null;
            touch.event = event;
            console.warn(touch, 'touchend');
        }, false);
        element.addEventListener('touchmove', function (event) {
            var x;
            var y;
            var touchEvent = event.touches[0];
            if (touchEvent.pageX || touchEvent.pageY) {
                x = touchEvent.pageX;
                y = touchEvent.pageY;
            } else {
                x = touchEvent.clientX + bodyScrollLeft + docElementScrollLeft;
                y = touchEvent.clientY + bodyScrollTop + docElementScrollTop;
            }
            x -= offsetLeft;
            y -= offsetTop;
            touch.x = x;
            touch.y = y;
            touch.event = event;
            var len = me.displayObjectList.length;
            for (var i = 0; i < len; i++) {
                me.displayObjectList[i].isMouseIn(util.getMouseCoords(touch.event.target, touchEvent));
            }
        }, false);
        return touch;
    }
    ;
    function Stage(opts) {
        Event.apply(this, arguments);
        opts = opts || {};
        if (!opts.canvas) {
            throw new Error('Stage must be require a canvas param');
        }
        this.name = opts.name === null || opts.name === undefined ? 'ig_stage_' + guid++ : opts.name;
        this.canvas = util.domWrap(opts.canvas, document.createElement('div'), 'ig-stage-container');
        this.ctx = this.canvas.getContext('2d');
        if (opts.width) {
            defaultCanvasWidth = opts.width;
        }
        if (opts.height) {
            defaultCanvasHeight = opts.height;
        }
        initStage(this.canvas, this);
        this.offCanvas = document.createElement('canvas');
        this.offCtx = this.offCanvas.getContext('2d');
        this.offCanvas.width = this.canvas.width;
        this.offCanvas.style.width = this.canvas.style.width;
        this.offCanvas.height = this.canvas.height;
        this.offCanvas.style.height = this.canvas.style.height;
        this.container = this.canvas.parentNode;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.bgColor = opts.bgColor || '#000';
        this.setBgColor();
        this.displayObjectList = [];
        this.displayObjects = {};
    }
    Stage.prototype = {
        constructor: Stage,
        clear: function () {
            var me = this;
            me.ctx.clearRect(0, 0, me.width, me.height);
        },
        setBgColor: function (color) {
            var me = this;
            me.bgColor = color || me.bgColor;
            me.canvas.style.backgroundColor = me.bgColor;
        },
        setBgImg: function (imgUrl, repeatPattern) {
            var me = this;
            me.canvas.style.backgroundImage = 'url(' + imgUrl + ')';
            switch (repeatPattern) {
            case 'center':
                me.canvas.style.backgroundRepeat = 'no-repeat';
                me.canvas.style.backgroundPosition = 'center';
                break;
            case 'full':
                me.canvas.style.backgroundSize = me.width + 'px ' + me.height + 'px';
                break;
            }
        },
        clean: function () {
            var me = this;
            me.container.removeChild(me.canvas);
            me.container.parentNode.removeChild(me.container);
            me.container = null;
            me.canvas = me.ctx = null;
            me.offCanvas = me.offCtx = null;
        },
        update: function () {
            var me = this;
            var displayObjectList = me.displayObjectList;
            var len = displayObjectList.length;
            var displayObjectStatus;
            for (var i = 0; i < len; i++) {
                displayObjectStatus = me.displayObjectList[i].status;
                if (displayObjectStatus === 1 || displayObjectStatus === 2) {
                    this.displayObjectList[i].update();
                }
            }
        },
        render: function () {
            var me = this;
            me.clear();
            me.fire('Stage:beforeRender', { data: {} });
            this.sortDisplayObject();
            this.renderDisplayObject();
            me.fire('Stage:afterRender', { data: {} });
        },
        renderDisplayObject: function () {
            var me = this;
            var displayObjectList = me.displayObjectList;
            var len = displayObjectList.length;
            var displayObjectStatus;
            me.offCtx.save();
            me.offCtx.clearRect(0, 0, me.offCanvas.width, me.offCanvas.height);
            for (var i = 0; i < len; i++) {
                displayObjectStatus = me.displayObjectList[i].status;
                if (displayObjectStatus === 1 || displayObjectStatus === 3) {
                    me.displayObjectList[i].render(me.offCtx);
                }
            }
            me.offCtx.restore();
            me.ctx.drawImage(me.offCanvas, 0, 0);
        },
        sortDisplayObject: function () {
            this.displayObjectList.sort(function (o1, o2) {
                return o1.zIndex - o2.zIndex;
            });
        },
        getDisplayObjectList: function () {
            return this.displayObjectList;
        },
        getDisplayObjectByName: function (name) {
            return this.displayObjects[name];
        },
        createDisplayObject: function (displayObjOpts) {
            var displayObj = new DisplayObject(displayObjOpts);
            this.addDisplayObject(displayObj);
            return displayObj;
        },
        addDisplayObject: function (displayObj) {
            var me = this;
            if (displayObj && !me.getDisplayObjectByName(displayObj.name)) {
                displayObj.stageOwner = me;
                me.displayObjectList.push(displayObj);
                me.displayObjects[displayObj.name] = displayObj;
            }
        },
        removeDisplayObject: function (displayObj) {
            displayObj && this.removeDisplayObjectByName(displayObj.name);
        },
        removeDisplayObjectByName: function (name) {
            var me = this;
            var candidateObj = me.displayObjects[name];
            if (candidateObj) {
                delete me.displayObjects[candidateObj.name];
                var displayObjectList = me.displayObjectList;
                util.removeArrByCondition(displayObjectList, function (o) {
                    return o.name === name;
                });
            }
        },
        clearAllDisplayObject: function () {
            this.displayObjectList = [];
            this.displayObjects = {};
        }
    };
    util.inherits(Stage, Event);
    return Stage;
});define('ig/DisplayObject', [
    'require',
    './Event',
    './util'
], function (require) {
    'use strict';
    var Event = require('./Event');
    var util = require('./util');
    var guid = 0;
    function DisplayObject(opts) {
        var me = this;
        opts = opts || {};
        Event.apply(me, arguments);
        me.name = opts.name === null || opts.name === undefined ? 'ig_displayobject_' + guid++ : opts.name;
        me.stageOwner = null;
        me.x = opts.x || 0;
        me.y = opts.y || 0;
        me.width = opts.width || 0;
        me.height = opts.height || 0;
        me.radius = opts.radius || 0;
        me.scaleX = opts.scaleX || 1;
        me.scaleY = opts.scaleY || 1;
        me.angle = opts.angle || 0;
        me.alpha = opts.alpha || 1;
        me.zIndex = opts.zIndex || 0;
        me.fillStyle = opts.fillStyle || null;
        me.strokeStyle = opts.strokeStyle || null;
        me.image = opts.image || null;
        me.vX = opts.vX || 0;
        me.vY = opts.vY || 0;
        me.aX = opts.aX || 0;
        me.aY = opts.aY || 0;
        me.frictionX = opts.frictionX || 1;
        me.frictionY = opts.frictionY || 1;
        me.reverseVX = false;
        me.reverseVY = false;
        me.status = 1;
        me.customProp = opts.customProp || {};
        me.debug = false;
        me.setPos(me.x, me.y);
    }
    DisplayObject.prototype = {
        constructor: DisplayObject,
        setPos: function (x, y) {
            var me = this;
            me.x = x || me.x;
            me.y = y || me.y;
        },
        setAcceleration: function (ax, ay) {
            var me = this;
            me.aX = ax || me.aX;
            me.aY = ay || me.aY;
        },
        setAccelerationX: function (ax) {
            var me = this;
            me.aX = ax || me.aX;
        },
        setAccelerationY: function (ay) {
            var me = this;
            me.aY = ay || me.aY;
        },
        resetAcceleration: function () {
            var me = this;
            me.aX = 0;
            me.aY = 0;
        },
        move: function (x, y) {
            var me = this;
            me.x += x;
            me.y += y;
        },
        moveStep: function () {
            var me = this;
            me.vX += me.aX;
            me.vX *= me.frictionX;
            me.x += me.vX;
            me.vY += me.aY;
            me.vY *= me.frictionY;
            me.y += me.vY;
        },
        setFrictionX: function (frictionX) {
            var me = this;
            me.frictionX = frictionX;
        },
        setFrictionY: function (frictionY) {
            var me = this;
            me.frictionY = frictionY;
        },
        rotate: function (angle) {
            var me = this;
            var offCtx = me.stageOwner.offCtx;
            offCtx.save();
            offCtx.rotate(util.deg2Rad(me.angle));
            offCtx.restore();
        },
        update: function () {
            return true;
        },
        render: function (offCtx) {
            return true;
        },
        isHit: function (other) {
            var me = this;
            var minX = me.x > other.x ? me.x : other.x;
            var maxX = me.x + me.width < other.x + other.width ? me.x + me.width : other.x + other.width;
            var minY = me.y > other.y ? me.y : other.y;
            var maxY = me.y + me.width < other.y + other.width ? me.y + me.width : other.y + other.width;
            return minX <= maxX && minY <= maxY;
        },
        isMouseIn: function (pos) {
            var me = this;
            var x = pos.x;
            var y = pos.y;
            var stage = me.stageOwner;
            var stageX = stage.x || 0;
            var stageY = stage.y || 0;
            var hw = 0;
            var hh = 0;
            if (x - stageX >= me.x - me.radius && x - stageX <= me.x + me.radius && y - stageY >= me.y - me.radius && y - stageY <= me.y + me.radius) {
                console.warn('你碰到我了');
            }
        }
    };
    function _drawDebugRect(offCtx) {
        var me = this;
        offCtx.save();
        offCtx.beginPath();
        offCtx.lineWidth = 1;
        offCtx.strokeStyle = '#fff';
        offCtx.globalAlpha = 0.8;
        offCtx.rect(me.x, me.y, me.width, me.height);
        offCtx.closePath();
        offCtx.stroke();
        offCtx.restore();
    }
    util.inherits(DisplayObject, Event);
    return DisplayObject;
});define('ig/SpriteSheet', [
    'require',
    './util',
    './DisplayObject'
], function (require) {
    'use strict';
    var util = require('./util');
    var DisplayObject = require('./DisplayObject');
    var guid = 0;
    var ANIMATION_DELAY = 0;
    function SpriteSheet(opts) {
        opts = opts || {};
        if (!opts.image) {
            throw new Error('SpriteSheet must be require a image param');
        }
        DisplayObject.apply(this, arguments);
        this.name = opts.name === null || opts.name === undefined ? 'ig_spritesheet_' + guid++ : opts.name;
        this.relativeX = opts.relativeX || 0;
        this.relativeY = opts.relativeY || 0;
        this.frameWidth = opts.frameWidth || 32;
        this.frameHeight = opts.frameHeight || 32;
        this.total = opts.total || 1;
        this.totalBackup = this.total;
        this.frameIndex = 0;
        this.frameStartX = opts.frameStartX || 0;
        this.frameStartXBackup = this.frameStartX;
        this.frameStartY = opts.frameStartY || 0;
        this.frameStartYBackup = this.frameStartY;
        this.offsets = opts.offsets;
        this._offsetX = 0;
        this._offsetY = 0;
        this._offsetWidth = 0;
        this._offsetHeight = 0;
        ANIMATION_DELAY = 0;
    }
    SpriteSheet.prototype = {
        constructor: SpriteSheet,
        update: function () {
            var me = this;
            if (ANIMATION_DELAY % 1 === 0) {
                me._offsetX = 0;
                me._offsetY = 0;
                me._offsetWidth = 0;
                me._offsetHeight = 0;
                if (me.offsets && me.offsets[me.frameIndex]) {
                    me._offsetX = me.offsets[me.frameIndex].x || 0;
                    me._offsetY = me.offsets[me.frameIndex].y || 0;
                    me._offsetWidth = me.offsets[me.frameIndex].width || 0;
                    me._offsetHeight = me.offsets[me.frameIndex].height || 0;
                }
                me.relativeX = me.frameStartX * me.frameWidth + me.frameIndex * me.frameWidth + me._offsetX;
                me.relativeY = me.frameStartY * me.frameHeight + me._offsetY;
                me.frameIndex++;
                if (me.frameIndex >= me.total) {
                    me.frameIndex = 0;
                    me.frameStartY = me.frameStartYBackup;
                    me.total = me.totalBackup;
                }
                if (me.frameIndex * me.frameWidth >= me.image.width) {
                    me.frameStartY++;
                    me.total = me.total - me.frameIndex;
                    me.frameIndex = 0;
                }
            }
            ANIMATION_DELAY++;
        },
        render: function (offCtx) {
            var me = this;
            offCtx.save();
            offCtx.globalAlpha = me.alpha;
            offCtx.translate(me.x, me.y);
            offCtx.rotate(util.deg2Rad(me.angle));
            offCtx.scale(me.scaleX, me.scaleY);
            offCtx.drawImage(me.image, me.relativeX, me.relativeY, me.frameWidth + me._offsetWidth, me.frameHeight + me._offsetHeight, -me.frameWidth / 2, -me.frameHeight / 2, me.frameWidth + me._offsetWidth, me.frameHeight + me._offsetHeight);
            offCtx.restore();
        }
    };
    util.inherits(SpriteSheet, DisplayObject);
    return SpriteSheet;
});define('ig/ParallaxScroll', [
    'require',
    './util',
    './DisplayObject'
], function (require) {
    'use strict';
    var util = require('./util');
    var DisplayObject = require('./DisplayObject');
    var guid = 0;
    var newImage4Repeat = new Image();
    function ParallaxScroll(opts) {
        opts = opts || {};
        if (!opts.image) {
            throw new Error('ParallaxScroll must be require a image param');
        }
        DisplayObject.apply(this, arguments);
        this.name = opts.name === null || opts.name === undefined ? 'ig_parallaxscroll_' + guid++ : opts.name;
        this.image = opts.image;
        this.repeat = opts.repeat && [
            'repeat',
            'repeat-x',
            'repeat-y'
        ].indexOf(opts.repeat) !== -1 ? opts.repeat : 'no-repeat';
    }
    ParallaxScroll.prototype = {
        constructor: ParallaxScroll,
        update: function () {
            var me = this;
            me.vX = (me.vX + me.aX) % me.image.width;
            me.vY = (me.vY + me.aY) % me.image.height;
        },
        render: function (offCtx) {
            var me = this;
            if (me.repeat !== 'no-repeat') {
                _renderRepeatImage.call(me, offCtx);
            }
            var imageWidth = me.image.width;
            var imageHeight = me.image.height;
            var drawArea = {
                width: 0,
                height: 0
            };
            for (var y = 0; y < imageHeight; y += drawArea.height) {
                for (var x = 0; x < imageWidth; x += drawArea.width) {
                    var newPos = {
                        x: me.x + x,
                        y: me.y + y
                    };
                    var newArea = {
                        width: imageWidth - x,
                        height: imageHeight - y
                    };
                    var newScrollPos = {
                        x: 0,
                        y: 0
                    };
                    if (x === 0) {
                        newScrollPos.x = me.vX;
                    }
                    if (y === 0) {
                        newScrollPos.y = me.vY;
                    }
                    drawArea = _drawScroll.call(me, offCtx, newPos, newArea, newScrollPos, imageWidth, imageHeight);
                }
            }
        }
    };
    function _drawScroll(offCtx, newPos, newArea, newScrollPos, imageWidth, imageHeight) {
        var me = this;
        var xOffset = Math.abs(newScrollPos.x) % imageWidth;
        var yOffset = Math.abs(newScrollPos.y) % imageHeight;
        var left = newScrollPos.x < 0 ? imageWidth - xOffset : xOffset;
        var top = newScrollPos.y < 0 ? imageHeight - yOffset : yOffset;
        var width = newArea.width < imageWidth - left ? newArea.width : imageWidth - left;
        var height = newArea.height < imageHeight - top ? newArea.height : imageHeight - top;
        offCtx.drawImage(me.image, left, top, width, height, newPos.x, newPos.y, width, height);
        return {
            width: width,
            height: height
        };
    }
    function _renderRepeatImage(offCtx) {
        var me = this;
        offCtx.save();
        offCtx.fillStyle = offCtx.createPattern(me.image, me.repeat);
        offCtx.fillRect(me.x, me.y, offCtx.canvas.width, offCtx.canvas.height);
        offCtx.restore();
        if (!newImage4Repeat.src) {
            newImage4Repeat.src = offCtx.canvas.toDataURL();
            me.image = newImage4Repeat;
        }
    }
    util.inherits(ParallaxScroll, DisplayObject);
    return ParallaxScroll;
});define('ig/Shape/Ball', [
    'require',
    '../util',
    '../DisplayObject'
], function (require) {
    'use strict';
    var util = require('../util');
    var DisplayObject = require('../DisplayObject');
    function Ball(opts) {
        var me = this;
        DisplayObject.apply(me, arguments);
    }
    Ball.prototype = {
        constructor: Ball,
        update: function () {
            var me = this;
            var w = me.stageOwner.width;
            var h = me.stageOwner.height;
            if (me.x < me.radius || me.x > w - me.radius) {
                me.vX = -me.vX;
            }
            ;
            if (me.y < me.radius || me.y > h - me.radius) {
                me.vY = -me.vY;
            }
            me.moveStep();
        },
        render: function (ctx) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.radius - 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.strokeStyle = 'white';
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            Ball.superClass.render.apply(this, arguments);
        }
    };
    util.inherits(Ball, DisplayObject);
    return Ball;
});define('ig/resourceLoader', [
    'require',
    './ig',
    './util'
], function (require) {
    var ig = require('./ig');
    var util = require('./util');
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
    function getFileExt(fileName) {
        var segments = fileName.split('.');
        return segments[segments.length - 1].toLowerCase();
    }
    ig.resources = {};
    var exports = {};
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
                    } else {
                        _callback(_id, req.responseText);
                    }
                } else {
                    _errorCallback(_src);
                }
            }
        };
        req.open('GET', _src, true);
        req.send(null);
    };
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
                throw 'Loading Error: ' + errItem;
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
            } else {
                resourceId = resourceSrc = curResource;
            }
            var invokeMethod = me['load' + resourceTypes[getFileExt(resourceSrc)]];
            if (!invokeMethod) {
                invokeMethod = me.loadOther;
            }
            invokeMethod(resourceId, resourceSrc, loadOneCallback, errorCallback);
        }
    };
    return exports;
});
var ig = require('ig');


var modName = 'ig/util';
var refName = 'util';
var folderName = '';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}

var modName = 'ig/Event';
var refName = 'Event';
var folderName = '';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}

var modName = 'ig/env';
var refName = 'env';
var folderName = '';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}

var modName = 'ig/ImageLoader';
var refName = 'ImageLoader';
var folderName = '';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}

var modName = 'ig/Game';
var refName = 'Game';
var folderName = '';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}

var modName = 'ig/FrameMonitor';
var refName = 'FrameMonitor';
var folderName = '';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}

var modName = 'ig/Stage';
var refName = 'Stage';
var folderName = '';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}

var modName = 'ig/DisplayObject';
var refName = 'DisplayObject';
var folderName = '';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}

var modName = 'ig/SpriteSheet';
var refName = 'SpriteSheet';
var folderName = '';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}

var modName = 'ig/ParallaxScroll';
var refName = 'ParallaxScroll';
var folderName = '';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}

var modName = 'ig/Shape/Ball';
var refName = 'Ball';
var folderName = 'Shape';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}

var modName = 'ig/resourceLoader';
var refName = 'resourceLoader';
var folderName = '';

if (folderName) {
    var tmp = {};
    tmp[refName] = require(modName);
    ig[folderName] = tmp;
}
else {
    ig[refName] = require(modName);
}


_global['ig'] = ig;

})(window);
