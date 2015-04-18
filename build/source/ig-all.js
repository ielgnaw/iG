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
'use strict';
define('ig/ig', ['require'], function (require) {
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
});'use strict';
define('ig/util', ['require'], function (require) {
    var DEG2RAD_OPERAND = Math.PI / 180;
    var RAD2DEG_OPERAND = 180 / Math.PI;
    var objectProto = Object.prototype;
    var exports = {};
    exports.noop = function () {
    };
    exports.getType = function (obj) {
        var cls = objectProto.toString.call(obj).slice(8, -1);
        return cls.toLowerCase();
    };
    exports.isType = function (type, obj) {
        var objectType = exports.getType(obj);
        return type.toLowerCase() === objectType;
    };
    exports.isWindow = function (obj) {
        return obj != null && obj === obj.window;
    };
    exports.isPlainObject = function (obj) {
        if (exports.getType(obj) !== 'object' || obj.nodeType || exports.isWindow(obj)) {
            return false;
        }
        if (obj.constructor && !{}.hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }
        return true;
    };
    exports.extend = function () {
        var options;
        var name;
        var src;
        var copy;
        var copyIsArray;
        var clone;
        var target = arguments[0] || {};
        var i = 1;
        var length = arguments.length;
        var deep = false;
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[i] || {};
            i++;
        }
        if (typeof target !== 'object' && !exports.isType('function', target)) {
            target = {};
        }
        if (i === length) {
            target = this;
            i--;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    if (options.hasOwnProperty(name)) {
                        src = target[name];
                        copy = options[name];
                        if (target === copy) {
                            continue;
                        }
                        if (deep && copy && (exports.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && Array.isArray(src) ? src : [];
                            } else {
                                clone = src && exports.isPlainObject(src) ? src : {};
                            }
                            target[name] = exports.extend(deep, clone, copy);
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
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
            if (selfPrototype.hasOwnProperty(key)) {
                proto[key] = selfPrototype[key];
            }
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
    exports.window2Canvas = function (canvas, x, y) {
        var boundRect = canvas.getBoundingClientRect();
        return {
            x: Math.round(x - boundRect.left * (canvas.width / boundRect.width)),
            y: Math.round(y - boundRect.top * (canvas.height / boundRect.height))
        };
    };
    exports.domWrap = function (curNode, newNode, newNodeId) {
        curNode.parentNode.insertBefore(newNode, curNode);
        newNode.appendChild(curNode);
        newNode.id = newNodeId || 'ig-create-dom-' + Date.now();
        return curNode;
    };
    exports.getElementOffset = function (element) {
        var x = element.offsetLeft;
        var y = element.offsetTop;
        while ((element = element.offsetParent) && element != document.body && element != document) {
            x += element.offsetLeft;
            y += element.offsetTop;
        }
        return {
            x: x,
            y: y
        };
    };
    return exports;
});'use strict';
define('ig/easing', ['require'], function (require) {
    var easing = {};
    easing.linear = function (t, b, c, d) {
        return c * t / d + b;
    };
    easing.easeInQuad = function (t, b, c, d) {
        return c * (t /= d) * t + b;
    };
    easing.easeOutQuad = function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    };
    easing.easeInOutQuad = function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * (--t * (t - 2) - 1) + b;
    };
    easing.easeInCubic = function (t, b, c, d) {
        return c * (t /= d) * t * t + b;
    };
    easing.easeOutCubic = function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    };
    easing.easeInOutCubic = function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    };
    easing.easeInQuart = function (t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    };
    easing.easeOutQuart = function (t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    };
    easing.easeInOutQuart = function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t + b;
        }
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    };
    easing.easeInQuint = function (t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    };
    easing.easeOutQuint = function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    };
    easing.easeInOutQuint = function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    };
    easing.easeInSine = function (t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    };
    easing.easeOutSine = function (t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    };
    easing.easeInOutSine = function (t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    };
    easing.easeInExpo = function (t, b, c, d) {
        return t === 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    };
    easing.easeOutExpo = function (t, b, c, d) {
        return t === d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    };
    easing.easeInOutExpo = function (t, b, c, d) {
        if (t === 0) {
            return b;
        }
        if (t === d) {
            return b + c;
        }
        if ((t /= d / 2) < 1) {
            return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        }
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    };
    easing.easeInCirc = function (t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    };
    easing.easeOutCirc = function (t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    };
    easing.easeInOutCirc = function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        }
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    };
    easing.easeInElastic = function (t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        if ((t /= d) === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        var s;
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    };
    easing.easeOutElastic = function (t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        if ((t /= d) === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        var s;
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    };
    easing.easeInOutElastic = function (t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        if ((t /= d / 2) === 2) {
            return b + c;
        }
        if (!p) {
            p = d * (0.3 * 1.5);
        }
        var s;
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        if (t < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    };
    easing.easeInBack = function (t, b, c, d, s) {
        if (s === void 0) {
            s = 1.70158;
        }
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    };
    easing.easeOutBack = function (t, b, c, d, s) {
        if (s === void 0) {
            s = 1.70158;
        }
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    };
    easing.easeInOutBack = function (t, b, c, d, s) {
        if (s === void 0) {
            s = 1.70158;
        }
        if ((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
        }
        return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    };
    easing.easeInBounce = function (t, b, c, d) {
        return c - easing.easeOutBounce(d - t, 0, c, d) + b;
    };
    easing.easeOutBounce = function (t, b, c, d) {
        if ((t /= d) < 1 / 2.75) {
            return c * (7.5625 * t * t) + b;
        } else if (t < 2 / 2.75) {
            return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
        } else if (t < 2.5 / 2.75) {
            return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
        }
        return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    };
    easing.easeInOutBounce = function (t, b, c, d) {
        if (t < d / 2) {
            return easing.easeInBounce(t * 2, 0, c, d) * 0.5 + b;
        }
        return easing.easeOutBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
    };
    return easing;
});'use strict';
define('ig/env', ['require'], function (require) {
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
});'use strict';
define('ig/Animation', [
    'require',
    './util',
    './Event',
    './easing'
], function (require) {
    var util = require('./util');
    var Event = require('./Event');
    var easing = require('./easing');
    var DEFAULT_FPS = 60;
    var GUID_KEY = 0;
    function Animation(opts) {
        opts = opts || {};
        this.p = {};
        util.extend(true, this.p, {
            name: GUID_KEY++,
            source: {},
            target: null,
            range: null,
            tween: easing.linear,
            repeat: false,
            duration: 1000,
            fps: DEFAULT_FPS
        }, opts);
        this.setup();
        Event.apply(this, this.p);
        return this;
    }
    Animation.prototype = {
        constructor: Animation,
        setup: function () {
            var p = this.p;
            p.paused = false;
            p.repeatCount = 0;
            p.then = Date.now();
            p.interval = 1000 / p.fps;
            p.curFrame = 0;
            p.curState = {};
            p.initState = {};
            p.frames = Math.ceil(p.duration * p.fps / 1000);
            var source = p.source;
            var target = p.target;
            var range = p.range;
            if (range) {
                for (var i in range) {
                    p.curState[i] = {
                        from: parseFloat(parseFloat(source[i]) - parseFloat(range[i])),
                        cur: parseFloat(source[i]),
                        to: parseFloat(parseFloat(source[i]) + parseFloat(range[i]))
                    };
                }
                return this;
            }
            if (util.getType(target) !== 'array') {
                for (var i in target) {
                    p.initState[i] = p.curState[i] = {
                        from: parseFloat(source[i]),
                        cur: parseFloat(source[i]),
                        to: parseFloat(target[i])
                    };
                }
                return this;
            }
            p.animIndex = 0;
            p.animLength = target.length;
            for (var m = 0; m < p.animLength; m++) {
                for (var i in target[m]) {
                    if (m === 0) {
                        p.curState[i] = {
                            from: parseFloat(source[i]),
                            cur: parseFloat(source[i]),
                            to: parseFloat(target[m][i])
                        };
                    }
                    p.initState[i] = {
                        from: parseFloat(source[i]),
                        cur: parseFloat(source[i]),
                        to: parseFloat(target[m][i])
                    };
                }
            }
            return this;
        },
        play: function () {
            var p = this.p;
            if (p.requestID) {
                this.stop();
            }
            p.paused = false;
            this.step();
            return this;
        },
        stop: function () {
            window.cancelAnimationFrame(this.p.requestID);
            return this;
        },
        destroy: function () {
            this.stop();
            this.clearEvents();
        },
        togglePause: function () {
            this.p.paused = !this.p.paused;
            return this;
        },
        pause: function () {
            this.p.paused = true;
            return this;
        },
        resume: function () {
            this.p.paused = false;
            return this;
        },
        next: function () {
            this.stop();
            var p = this.p;
            p.curFrame++;
            p.curFrame = p.curFrame > p.frames ? p.frames : p.curFrame;
            this.step.call(this);
            return this;
        },
        prev: function () {
            this.stop();
            var p = this.p;
            p.curFrame--;
            p.curFrame = p.curFrame < 0 ? 0 : p.curFrame;
            this.step.call(this);
            return this;
        },
        gotoAndPlay: function (frame) {
            this.stop();
            this.p.curFrame = frame;
            this.play.call(this);
            return this;
        },
        gotoAndStop: function (frame) {
            this.stop();
            this.p.curFrame = frame;
            this.step.call(this);
            return this;
        },
        swapFromTo: function () {
            var p = this.p;
            p.curFrame = 0;
            p.curState = {};
            if (util.getType(p.target) === 'array') {
                p.target.reverse();
                p.animIndex = 0;
                p.animLength = p.target.length;
                for (var i in p.target[p.animIndex]) {
                    if (p.repeatCount % 2 === 0) {
                        p.curState[i] = {
                            from: p.initState[i].from,
                            cur: p.initState[i].cur,
                            to: p.initState[i].to
                        };
                    } else {
                        p.curState[i] = {
                            from: p.initState[i].to,
                            cur: p.initState[i].to,
                            to: p.initState[i].from
                        };
                    }
                }
            } else {
                for (var i in p.target) {
                    if (p.repeatCount % 2 === 0) {
                        p.curState[i] = {
                            from: p.initState[i].from,
                            cur: p.initState[i].cur,
                            to: p.initState[i].to
                        };
                    } else {
                        p.curState[i] = {
                            from: p.initState[i].to,
                            cur: p.initState[i].to,
                            to: p.initState[i].from
                        };
                    }
                }
            }
            return this;
        },
        step: function () {
            var me = this;
            var p = me.p;
            p.requestID = window.requestAnimationFrame(function (context) {
                return function () {
                    me.step.call(me);
                };
            }(me));
            if (p.paused) {
                return;
            }
            p.now = Date.now();
            p.delta = p.now - p.then;
            if (p.delta <= p.interval) {
                return;
            }
            me.fire('step', {
                data: {
                    source: p.source,
                    instance: me
                }
            });
            p.then = p.now - p.delta % p.interval;
            var ds;
            for (var i in p.curState) {
                ds = p.tween(p.curFrame, p.curState[i].cur, p.curState[i].to - p.curState[i].cur, p.frames).toFixed(2);
                p.source[i] = parseFloat(ds);
            }
            p.curFrame++;
            if (p.curFrame < p.frames) {
                return;
            }
            if (p.range && !p.rangeExec) {
                p.curFrame = 0;
                for (var i in p.curState) {
                    p.curState[i] = {
                        from: p.curState[i].to,
                        cur: p.curState[i].to,
                        to: p.curState[i].from
                    };
                }
                if (!p.repeat) {
                    p.rangeExec = true;
                } else {
                    p.repeatCount++;
                    if (p.repeatCount % 2 === 0) {
                        me.fire('repeat', {
                            data: {
                                source: p.source,
                                instance: me,
                                repeatCount: p.repeatCount / 2
                            }
                        });
                    }
                }
            } else {
                if (p.animLength) {
                    me.fire('groupComplete', {
                        data: {
                            source: p.source,
                            instance: me
                        }
                    });
                    if (p.animIndex < p.animLength - 1) {
                        p.animIndex++;
                        p.curFrame = 0;
                        p.curState = {};
                        var flag = p.repeatCount % 2 === 0;
                        for (var i in p.target[p.animIndex]) {
                            p.curState[i] = {
                                from: flag ? p.initState[i].from : p.initState[i].to,
                                cur: flag ? p.initState[i].cur : p.initState[i].to,
                                to: flag ? p.initState[i].to : p.initState[i].from
                            };
                        }
                    } else {
                        if (p.repeat) {
                            p.repeatCount++;
                            me.swapFromTo();
                            me.fire('repeat', {
                                data: {
                                    source: p.source,
                                    instance: me,
                                    repeatCount: p.repeatCount
                                }
                            });
                        } else {
                            me.stop();
                            p.paused = false;
                            me.fire('complete', {
                                data: {
                                    source: p.source,
                                    instance: me
                                }
                            });
                        }
                    }
                } else {
                    if (p.repeat) {
                        p.repeatCount++;
                        me.swapFromTo();
                        me.fire('repeat', {
                            data: {
                                source: p.source,
                                instance: me,
                                repeatCount: p.repeatCount
                            }
                        });
                    } else {
                        me.stop();
                        p.paused = false;
                        me.fire('complete', {
                            data: {
                                source: p.source,
                                instance: me
                            }
                        });
                    }
                }
            }
        }
    };
    util.inherits(Animation, Event);
    return Animation;
});'use strict';
define('ig/Vector', ['require'], function (require) {
    var sqrt = Math.sqrt;
    var pow = Math.pow;
    function Vector(x, y) {
        this.x = x || 0;
        this.y = y || x || 0;
    }
    Vector.prototype = {
        constructor: Vector,
        normalize: function () {
            var m = this.getMagnitude();
            if (m !== 0) {
                this.x /= m;
                this.y /= m;
            }
            return this;
        },
        getMagnitude: function () {
            return sqrt(pow(this.x, 2) + pow(this.y, 2));
        },
        add: function (other, isNew) {
            var x = this.x + other.x;
            var y = this.y + other.y;
            if (isNew) {
                return new Vector(x, y);
            }
            this.x = x;
            this.y = y;
            return this;
        },
        sub: function (other, isNew) {
            var x = this.x - other.x;
            var y = this.y - other.y;
            if (isNew) {
                return new Vector(x, y);
            }
            this.x = x;
            this.y = y;
            return this;
        },
        dot: function (other) {
            return this.x * other.x + this.y * other.y;
        },
        edge: function (other) {
            return this.sub(other, true);
        },
        perpendicular: function (isNew) {
            var x = -this.x;
            var y = this.y;
            if (isNew) {
                return new Vector(x, y);
            }
            this.x = x;
            this.y = y;
            return this;
        },
        normal: function () {
            return this.perpendicular(true).normalize();
        }
    };
    return Vector;
});'use strict';
define('ig/Game', [
    'require',
    './Event',
    './util',
    './env',
    './Stage',
    './resourceLoader'
], function (require) {
    var Event = require('./Event');
    var util = require('./util');
    var env = require('./env');
    var Stage = require('./Stage');
    var resourceLoader = require('./resourceLoader');
    var DEFAULT_FPS = 60;
    var GUID_KEY = 0;
    var STANDARD_WIDTH = 320;
    var MAX_WIDTH = 5000;
    var STANDARD_HEIGHT = 480;
    var MAX_HEIGHT = 5000;
    function Game(opts) {
        this.p = {};
        util.extend(true, this.p, {
            name: 'ig_game_' + GUID_KEY++,
            fps: DEFAULT_FPS,
            canvas: null,
            maximize: false,
            scaleFit: true,
            width: STANDARD_WIDTH,
            height: STANDARD_HEIGHT,
            maxWidth: MAX_WIDTH,
            maxHeight: MAX_HEIGHT,
            horizontalPageScroll: null
        }, opts);
        if (!this.p.canvas) {
            throw new Error('Game initialize must be require a canvas param');
        }
        this.p.paused = false;
        this.p.stageStack = [];
        this.p.stages = {};
        initGame.call(this);
        this._ = {};
        this.resources = this.p.resources = resourceLoader.resources;
        Event.apply(this, this.p);
        return this;
    }
    Game.prototype = {
        constructor: Game,
        start: function (startStageName, startCallback) {
            var _ = this._;
            var p = this.p;
            p.paused = false;
            _.startTime = Date.now();
            _.now = 0;
            _.interval = 1000 / p.fps;
            _.delta = 0;
            _.realFpsStart = Date.now();
            _.realFps = 0;
            _.realDelta = 0;
            _.totalFrameCounter = 0;
            var _startStageName = '';
            var _startCallback = util.noop;
            var argLength = arguments.length;
            switch (argLength) {
            case 1:
                if (util.getType(arguments[0]) === 'function') {
                    _startCallback = arguments[0];
                } else {
                    _startStageName = arguments[0];
                    _startCallback = util.noop;
                }
                break;
            case 2:
                _startStageName = arguments[0];
                _startCallback = arguments[1];
                break;
            default:
            }
            if (_startStageName) {
                var stageStack = p.stageStack;
                var candidateIndex = -1;
                for (var i = 0, len = stageStack.length; i < len; i++) {
                    if (stageStack[i].name === _startStageName) {
                        candidateIndex = i;
                        break;
                    }
                }
                this.swapStage(candidateIndex, 0);
            }
            this.stop();
            var me = this;
            me.render.call(me, _startStageName);
            util.getType(_startCallback) === 'function' && _startCallback.call(me, {
                data: {
                    startTime: _.startTime,
                    interval: _.interval
                }
            });
            return this;
        },
        render: function () {
            var me = this;
            var p = me.p;
            var _ = me._;
            p.requestID = window.requestAnimationFrame(function (context) {
                return function () {
                    context.render.call(context);
                };
            }(me));
            if (!p.paused) {
                _.now = Date.now();
                _.delta = _.now - _.startTime;
                if (_.delta > _.interval) {
                    _.totalFrameCounter++;
                    _.startTime = _.now - _.delta % _.interval;
                    me.fire('beforeGameRender', {
                        data: {
                            startTime: _.startTime,
                            totalFrameCounter: _.totalFrameCounter
                        }
                    });
                    var curStage = me.getCurrentStage();
                    if (curStage) {
                        curStage.update(_.totalFrameCounter, _.delta);
                        curStage.render();
                    }
                    me.fire('afterGameRender', {
                        data: {
                            startTime: _.startTime,
                            totalFrameCounter: _.totalFrameCounter
                        }
                    });
                }
                if (_.realDelta > 1000) {
                    _.realFpsStart = Date.now();
                    _.realDelta = 0;
                    me.fire('gameFPS', {
                        data: {
                            fps: _.realFps,
                            totalFrameCounter: _.totalFrameCounter
                        }
                    });
                    _.realFps = 0;
                } else {
                    _.realDelta = Date.now() - _.realFpsStart;
                    ++_.realFps;
                }
            }
        },
        pause: function () {
            this.p.paused = true;
            return this;
        },
        resume: function () {
            this.p.paused = false;
            return this;
        },
        stop: function () {
            window.cancelAnimationFrame(this.p.requestID);
            return this;
        },
        destroy: function () {
            this.stop();
            this.clearEvents();
        },
        createStage: function (stageOpts) {
            var p = this.p;
            stageOpts = util.extend(true, {}, {
                canvas: p.canvas,
                offCanvas: p.offCanvas,
                game: this
            }, stageOpts);
            var stage = new Stage(stageOpts);
            this.pushStage(stage);
            return stage;
        },
        pushStage: function (stage) {
            var p = this.p;
            if (!this.getStageByName(stage.name)) {
                stage.gameOwner = this;
                p.stageStack.push(stage);
                p.stages[stage.name] = stage;
                this.sortStageIndex();
            }
        },
        popStage: function () {
            var p = this.p;
            var stage = p.stageStack.pop();
            if (stage) {
                delete p.stages[stage.name];
                this.sortStageIndex();
            }
        },
        sortStageIndex: function () {
            var stageStack = this.stageStack;
            for (var i = stageStack.length - 1, j = 0; i >= 0; i--, j++) {
                stageStack[i].zIndex = j;
            }
        },
        removeStageByName: function (name) {
            var st = this.getStageByName(name);
            var p = this.p;
            if (st) {
                delete p.stages[st.name];
                var stageStack = p.stageStack;
                util.removeArrByCondition(stageStack, function (s) {
                    return s.name === name;
                });
                this.sortStageIndex();
            }
        },
        getCurrentStage: function () {
            var p = this.p;
            return p.stageStack[0];
        },
        getStageStack: function () {
            return this.p.stageStack;
        },
        getStageByName: function (name) {
            return this.p.stages[name];
        },
        changeStage: function (stageName) {
            var p = this.p;
            if (stageName) {
                var stageStack = p.stageStack;
                var candidateIndex = -1;
                for (var i = 0, len = stageStack.length; i < len; i++) {
                    if (stageStack[i].name === stageName) {
                        candidateIndex = i;
                        break;
                    }
                }
                this.swapStage(candidateIndex, 0);
            }
        },
        swapStage: function (from, to) {
            var p = this.p;
            var stageStack = p.stageStack;
            var len = stageStack.length;
            if (from >= 0 && from <= len - 1 && to >= 0 && to <= len - 1) {
                var sc = stageStack[from];
                stageStack[from] = stageStack[to];
                stageStack[to] = sc;
                this.sortStageIndex();
            }
            p.ctx.clearRect(0, 0, p.canvas.width, p.canvas.height);
        },
        getStageIndex: function (stage) {
            return stage.zIndex;
        },
        clearAllStage: function () {
            var p = this.p;
            p.stages = {};
            p.stageStack = [];
        },
        loadOther: function (id, src, callback, errorCallback) {
            return resourceLoader.loadOther(id, src, callback, errorCallback);
        },
        loadImage: function (id, src, callback, errorCallback) {
            return resourceLoader.loadImage(id, src, callback, errorCallback);
        },
        loadResource: function (resource, callback, opts) {
            return resourceLoader.loadResource(resource, callback, opts);
        }
    };
    function initGame() {
        var p = this.p;
        p.canvas = util.domWrap(p.canvas, document.createElement('div'), 'ig-game-container-' + p.name);
        p.canvas.width = p.width;
        p.canvas.height = p.height;
        var width = parseInt(p.canvas.width, 10);
        var height = parseInt(p.canvas.height, 10);
        var maxWidth = p.maxWidth || 5000;
        var maxHeight = p.maxHeight || 5000;
        if (p.maximize) {
            document.body.style.padding = 0;
            document.body.style.margin = 0;
            var horizontalPageScroll;
            var horizontalPageScrollType = util.getType(p.horizontalPageScroll);
            if (horizontalPageScrollType === 'number') {
                horizontalPageScroll = p.horizontalPageScroll;
            } else if (horizontalPageScrollType === 'boolean') {
                horizontalPageScroll = 17;
            } else {
                horizontalPageScroll = 0;
            }
            width = Math.min(window.innerWidth, maxWidth) - horizontalPageScroll;
            height = Math.min(window.innerHeight - 5, maxHeight);
        }
        if (env.supportTouch) {
            p.canvas.style.height = height * 2 + 'px';
            window.scrollTo(0, 1);
            width = Math.min(window.innerWidth, maxWidth);
            height = Math.min(window.innerHeight, maxHeight);
        }
        p.ctx = p.canvas.getContext('2d');
        p.canvas.style.height = height + 'px';
        p.canvas.style.width = width + 'px';
        p.canvas.width = width;
        p.canvas.height = height;
        p.canvas.style.position = 'relative';
        p.width = p.canvas.width;
        p.cssWidth = p.canvas.style.width;
        p.height = p.canvas.height;
        p.cssHeight = p.canvas.style.height;
        setOffCanvas.call(this);
        var canvasParent = p.canvas.parentNode;
        canvasParent.style.width = width + 'px';
        canvasParent.style.margin = '0 auto';
        canvasParent.style.position = 'relative';
        if (p.scaleFit) {
            fitScreen.call(this);
        }
        var me = this;
        window.addEventListener(env.supportOrientation ? 'orientationchange' : 'resize', function () {
            setTimeout(function () {
                window.scrollTo(0, 1);
                if (p.scaleFit) {
                    fitScreen.call(me);
                }
            }, 0);
        }, false);
        p.ratioX = p.width / STANDARD_WIDTH;
        p.ratioY = p.height / STANDARD_HEIGHT;
        return this;
    }
    function setOffCanvas() {
        var p = this.p;
        if (!p.offCanvas) {
            p.offCanvas = document.createElement('canvas');
            p.offCtx = p.offCanvas.getContext('2d');
        }
        p.offCanvas.width = p.canvas.width;
        p.offCanvas.style.width = p.canvas.style.width;
        p.offCanvas.height = p.canvas.height;
        p.offCanvas.style.height = p.canvas.style.height;
    }
    function fitScreen() {
        var p = this.p;
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        var winRatio = winWidth / winHeight;
        var gameRatio = p.canvas.width / p.canvas.height;
        var scaleRatio = gameRatio < winRatio ? winHeight / p.canvas.height : winWidth / p.canvas.width;
        var scaleWidth = p.canvas.width * scaleRatio;
        var scaleHeight = p.canvas.height * scaleRatio;
        p.canvas.style.width = scaleWidth + 'px';
        p.canvas.style.height = scaleHeight + 'px';
        if (p.canvas.parentNode) {
            p.canvas.parentNode.style.width = scaleWidth + 'px';
            p.canvas.parentNode.style.height = scaleHeight + 'px';
        }
        if (gameRatio >= winRatio) {
            var topPos = (winHeight - scaleHeight) / 2;
            p.canvas.style.top = topPos + 'px';
        }
        p.width = p.canvas.width;
        p.cssWidth = p.canvas.style.width;
        p.height = p.canvas.height;
        p.cssHeight = p.canvas.style.height;
        p.scaleRatio = scaleRatio;
        setOffCanvas.call(this);
    }
    util.inherits(Game, Event);
    return Game;
});'use strict';
define('ig/Stage', [
    'require',
    './Event',
    './util',
    './DisplayObject',
    './domEvt'
], function (require) {
    var Event = require('./Event');
    var util = require('./util');
    var DisplayObject = require('./DisplayObject');
    var domEvt = require('./domEvt');
    function Stage(opts) {
        Event.apply(this, arguments);
        return this;
    }
    util.inherits(Stage, Event);
    return Stage;
});'use strict';
define('ig/Event', ['require'], function (require) {
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
        clearEvents: function () {
            this._events = {};
        },
        enable: function (target) {
            target._events = {};
            target.on = Event.prototype.on;
            target.un = Event.prototype.un;
            target.fire = Event.prototype.fire;
        }
    };
    return Event;
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
    var exports = {};
    ig.resources = exports.resources = {};
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
                callback.call(me, ig.resources);
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
            if (!ig.resources.hasOwnProperty(resourceId)) {
                var invokeMethod = me['load' + resourceTypes[getFileExt(resourceSrc)]];
                if (!invokeMethod) {
                    invokeMethod = me.loadOther;
                }
                invokeMethod(resourceId, resourceSrc, loadOneCallback, errorCallback);
            } else {
                loadOneCallback(resourceId, ig.resources[resourceId]);
            }
        }
    };
    return exports;
});
var ig = require('ig');


var modName = 'ig/util';
var refName = 'util';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/easing';
var refName = 'easing';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/env';
var refName = 'env';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/Animation';
var refName = 'Animation';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/Vector';
var refName = 'Vector';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/Game';
var refName = 'Game';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/Stage';
var refName = 'Stage';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/Event';
var refName = '';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/resourceLoader';
var refName = '';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}


_global['ig'] = ig;

})(window);
