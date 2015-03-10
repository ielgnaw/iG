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
    var exports = {};
    exports.noop = function () {
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
        return subClass;
    };
    exports.deg2Rad = function (deg) {
        return deg * Math.PI / 180;
    };
    exports.rad2Deg = function (rad) {
        return rad * 180 / Math.PI;
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
            list.splice(list, 1);
        }
    };
    exports.domWrap = function (curNode, newNode) {
        var _el = curNode.cloneNode(true);
        if (typeof newNode === 'string') {
            var tmp = document.createElement('div');
            tmp.innerHTML = newNode;
            tmp = tmp.children[0];
            tmp.appendChild(_el);
            curNode.parentNode.replaceChild(tmp, curNode);
        } else {
            newNode.appendChild(_el);
            curNode.parentNode.replaceChild(newNode, curNode);
        }
        return _el;
    };
    return exports;
});define('ig/Event', ['require'], function (require) {
    var guidKey = '_observerGUID';
    function Event() {
        this._events = {};
    }
    Event.prototype.on = function (type, handler) {
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
    };
    Event.prototype.un = function (type, handler) {
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
    };
    Event.prototype.fire = function (type, event) {
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
    };
    Event.enable = function (target) {
        target._events = {};
        target.on = Event.prototype.on;
        target.un = Event.prototype.un;
        target.fire = Event.prototype.fire;
    };
    return Event;
});define('ig/platform', ['require'], function (require) {
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
    var platform = detect(navigator.userAgent);
    var exports = {
        browser: platform.browser,
        os: platform.os,
        supportOrientation: typeof window.orientation == 'number' && typeof window.onorientationchange == 'object',
        supportTouch: 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch,
        supportGeolocation: navigator.geolocation != null
    };
    return exports;
});define('ig/BaseSprite', [
    'require',
    './util',
    './Event'
], function (require) {
    function _drawDebugRect(ctx) {
        var me = this;
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#fff';
        ctx.globalAlpha = 0.8;
        ctx.rect(me.x, me.y, me.width, me.height);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
    function BaseSprite(opts) {
        opts = opts || {};
        var me = this;
        me.x = opts.x || 0;
        me.y = opts.y || 0;
        me.width = opts.width || 20;
        me.height = opts.height || 20;
        me.vX = opts.vX || 0;
        me.vY = opts.vY || 0;
        me.aX = opts.aX || 0;
        me.aY = opts.aY || 0;
        me.reverseX = false;
        me.reverseY = false;
        me.alpha = opts.alpha || 1;
        me.scale = opts.scale || 1;
        me.angle = opts.angle || 0;
        me.radius = Math.random() * 30;
        me.status = 1;
        me.customProp = {};
        me.debug = false;
    }
    BaseSprite.prototype.isHit = function (otherSprite) {
        var me = this;
        var minX = me.x > otherSprite.x ? me.x : otherSprite.x;
        var maxX = me.x + me.width < otherSprite.x + otherSprite.width ? me.x + me.width : otherSprite.x + otherSprite.width;
        var minY = me.y > otherSprite.y ? me.y : otherSprite.y;
        var maxY = me.y + me.width < otherSprite.y + otherSprite.width ? me.y + me.width : otherSprite.y + otherSprite.width;
        return minX <= maxX && minY <= maxY;
    };
    BaseSprite.prototype.draw = function (ctx) {
        var me = this;
        ctx.save();
        ctx.globalAlpha = me.alpha;
        ctx.rotate(me.rotation * Math.PI / 180);
        ctx.translate(me.x * me.scale, me.y * me.scale);
        me.fire('BaseSprite:draw', me);
        if (me.debug) {
            _drawDebugRect.call(me, ctx);
        }
        ;
        ctx.restore();
    };
    require('./util').inherits(BaseSprite, require('./Event'));
    return BaseSprite;
});define('ig/ImageLoader', [
    'require',
    './util',
    './Event'
], function (require) {
    var arrayProto = Array.prototype;
    function ImageLoader() {
        this.images = {};
        this.imageUrls = [];
        this.imagesLoadedCount = 0;
        this.imagesErrorLoadedCount = 0;
        this.imageIndex = 0;
        this.imageLoadingProgressCallback = ig.noop;
        this.imageLoadedCallback = ig.noop;
        this.imageLoadedErrorCallback = ig.noop;
    }
    ;
    ImageLoader.prototype.loadImage = function (imageUrl) {
        var me = this;
        var img = new Image();
        img.src = imageUrl;
        img.addEventListener('load', function (e) {
            me.imagesLoadedCount++;
            typeof me.imageLoadedCallback === 'function' && me.imageLoadedCallback.call(me, e);
        });
        img.addEventListener('error', function (e) {
            me.imagesErrorLoadedCount++;
            typeof me.imageLoadedErrorCallback === 'function' && me.imageLoadedErrorCallback.call(me, e);
        });
        me.images[imageUrl] = img;
    };
    ImageLoader.prototype.loadImages = function () {
        var me = this;
        var imageUrlsLen = me.imageUrls.length;
        if (me.imageIndex < imageUrlsLen) {
            me.loadImage(me.imageUrls[me.imageIndex]);
            me.imageIndex++;
        }
        return (me.imagesLoadedCount + me.imagesErrorLoadedCount) / imageUrlsLen * 100;
    };
    ImageLoader.prototype.addImage = function (imageUrls) {
        var me = this;
        arrayProto.push[Array.isArray(imageUrls) ? 'apply' : 'call'](me.imageUrls, imageUrls);
    };
    require('./util').inherits(ImageLoader, require('./Event'));
    return ImageLoader;
});define('ig/Game', [
    'require',
    './Event',
    './util',
    './Stage',
    './FrameMonitor'
], function (require) {
    var Event = require('./Event');
    var util = require('./util');
    var Stage = require('./Stage');
    var FrameMonitor = require('./FrameMonitor');
    function Game() {
        Event.apply(this, arguments);
        this.paused = false;
        this.curGameFrameMonitor = new FrameMonitor();
        this.stageList = [];
        this.stages = {};
    }
    Game.prototype = {
        constructor: Game,
        render: function () {
            var me = this;
            me.curGameFrameMonitor.update();
            if (!me.paused) {
                me.requestID = window.requestAnimationFrame(function () {
                    me.render.call(me);
                });
            }
            me.fire('Game:beforeRender', {
                data: {
                    curFrame: me.curGameFrameMonitor.cur,
                    maxFrame: me.curGameFrameMonitor.max,
                    minFrame: me.curGameFrameMonitor.min
                }
            });
            me.fire('Game:afterRender', {
                data: {
                    curFrame: me.curGameFrameMonitor.cur,
                    maxFrame: me.curGameFrameMonitor.max,
                    minFrame: me.curGameFrameMonitor.min
                }
            });
        },
        start: function () {
            var me = this;
            me.paused = false;
            me.curGameFrameMonitor.reset();
            me.requestID = window.requestAnimationFrame(function () {
                me.curGameFrameMonitor.start();
                me.render.call(me);
            });
        },
        pause: function () {
            this.paused = true;
        },
        resume: function () {
            var me = this;
            me.paused = false;
            me.requestID = window.requestAnimationFrame(function () {
                me.render.call(me);
            });
        },
        stop: function () {
            window.cancelAnimationFrame(this.requestID);
        },
        createStage: function (stageOpts) {
            var st = new Stage(stageOpts);
            console.warn(st);
            this.pushStage(st);
            return st;
        },
        getStageList: function () {
            return this.stageList;
        },
        getStageByName: function (stageName) {
            return this.stages[stageName];
        },
        pushStage: function (stage) {
            var me = this;
            if (!me.getStageByName(stage.stageName)) {
                this.stageList.push(stage);
                this.stages[stage.stageName] = stage;
                this.sortStageIndex();
            }
        },
        popStage: function () {
            var me = this;
            var st = me.stageList.pop();
            if (st) {
                st.clean();
                delete me.stages[st.stageName];
                me.sortStageIndex();
            }
        },
        sortStageIndex: function () {
            var stageList = this.stageList;
            for (var i = 0, len = stageList.length; i < len; i++) {
                stageList[i].container.style.zIndex = i;
            }
        },
        remove: function (stageName) {
            var me = this;
            var st = me.getStageByName(stageName);
            if (st) {
                st.clean();
                delete me.stages[st.stageName];
                var stageList = me.stageList;
                util.removeArrByCondition(stageList, function (s) {
                    return s.stageName === stageName;
                });
                me.sortStageIndex();
            }
        },
        swapStage: function (from, to) {
            var me = this;
            var stageList = me.stageList;
            var len = stageList.length;
            if (from >= 0 && from <= len - 1 && to >= 0 && to <= len - 1) {
                var sc = stageList[from];
                stageList[from] = stageList[to];
                stageList[to] = sc;
                me.sortStageIndex();
            }
        },
        getStageIndex: function (stage) {
            return stage.container.style.zIndex;
        },
        getCurrentStage: function () {
            var me = this;
            return me.stageList[me.stageList.length - 1];
        },
        clearAllStage: function () {
            var me = this;
            for (var i = 0, len = me.stageList.length; i < len; i++) {
                me.stageList[i].clean();
            }
            me.stages = {};
            me.stageList = [];
        }
    };
    util.inherits(Game, Event);
    return Game;
});define('ig/FrameMonitor', ['require'], function (require) {
    function FrameMonitor() {
        this.max = 0;
        this.min = 9999;
        this.cur = 0;
        this.curTime = 0;
        this.expendPerFrame = 0;
        this.startTimePerSecond = 0;
        this.totalPerSecond = 0;
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
            this.curTime = this.startTimePerSecond = new Date();
        },
        update: function () {
            var cTime = new Date();
            if (cTime - this.startTimePerSecond >= 1000) {
                this.cur = this.totalPerSecond;
                this.max = this.cur > this.max ? this.cur : this.max;
                this.min = this.cur < this.min ? this.cur : this.min;
                this.totalPerSecond = 0;
                this.startTimePerSecond = cTime;
            } else {
                ++this.totalPerSecond;
            }
            this.expendPerFrame = cTime - this.curTime;
            this.curTime = cTime;
        }
    };
    return FrameMonitor;
});define('ig/Stage', [
    'require',
    './util'
], function (require) {
    var util = require('./util');
    function Stage(opts) {
        opts = opts || {};
        if (!opts.canvas) {
            throw new Error('Stage must be require a canvas param');
        }
        this.canvas = opts.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.container = this.canvas.parentNode;
        this.guid = 0;
        this.stageName = opts.stageName || 'ig_stage_' + ++this.guid;
        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.width = opts.width || this.canvas.width;
        this.height = opts.height || this.canvas.height;
        this.containerBgColor = opts.containerBgColor || '#000';
        this.setSize();
        this.setContainerBgColor();
    }
    Stage.prototype = {
        constructor: Stage,
        setSize: function (width, height) {
            var me = this;
            me.width = width || me.width;
            me.height = height || me.height;
            me.container.style.width = me.width + 'px';
            me.container.style.height = me.height + 'px';
            me.canvas.width = me.width;
            me.canvas.height = me.height;
            console.log(me.canvas);
        },
        setContainerBgColor: function (color) {
            var me = this;
            me.containerBgColor = me.containerBgColor || '#000';
            this.container.style.backgroundColor = me.containerBgColor;
        },
        setContainerBgImg: function (imgUrl, repeatPattern) {
            var me = this;
            me.container.style.backgroundImage = 'url(' + imgUrl + ')';
            switch (repeatPattern) {
            case 'center':
                me.container.style.backgroundRepeat = 'no-repeat';
                me.container.style.backgroundPosition = 'center';
                break;
            case 'full':
                me.container.style.backgroundSize = this.width + 'px ' + this.height + 'px';
                break;
            }
        }
    };
    return Stage;
});// var zrender = require('zrender');
// zrender.tool = {
//     color : require('zrender/tool/color'),
//     math : require('zrender/tool/math'),
//     util : require('zrender/tool/util'),
//     vector : require('zrender/tool/vector'),
//     area : require('zrender/tool/area'),
//     event : require('zrender/tool/event')
// }

// zrender.animation = {
//     Animation : require('zrender/animation/Animation'),
//     Cip : require('zrender/animation/Clip'),
//     easing : require('zrender/animation/easing')
// }
// var echarts = require('echarts');
// echarts.config = require('echarts/config');
// 

// require("ig/util");

// require("ig/Event");

// require("ig/platform");

// require("ig/BaseSprite");

// require("ig/ImageLoader");

// require("ig/Game");

// require("ig/FrameMonitor");

// require("ig/Stage");

// _global['echarts'] = echarts;
// _global['zrender'] = zrender;

var ig = require('ig');

ig['util'] = require('ig/util');

ig['Event'] = require('ig/Event');

ig['env'] = require('ig/platform');

ig['BaseSprite'] = require('ig/BaseSprite');

ig['ImageLoader'] = require('ig/ImageLoader');

ig['Game'] = require('ig/Game');

ig['FrameMonitor'] = require('ig/FrameMonitor');

ig['Stage'] = require('ig/Stage');


_global['ig'] = ig;

})(window);
