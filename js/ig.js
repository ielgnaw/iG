(function (root, factory) {
    var me = factory(root, {});
    if (typeof exports === 'object' && typeof module === 'object') {
        exports = module.exports = me;
    }
    else if (typeof define === 'function' && define.amd) {
        define(me);
    }
    else {
        root.ig = me;
    }
})(this, function (root, ig) {
    'use strict';

/**
 * @file 核心
 * @author ielgnaw(wuji0223@gmail.com)
 */

(function (root, ig, undefined) {

    /**
     * requestAnimationFrame polyfill
     */
    ig.requestAnimFrame = (function () {
        return root.requestAnimationFrame
            || root.webkitRequestAnimationFrame
            || root.mozRequestAnimationFrame
            || root.msRequestAnimationFrame
            || root.oRequestAnimationFrame
            || function (callback, elem) {
                    var me = this;
                    var start;
                    var finish;
                    root.setTimeout(function () {
                        start = +new Date();
                        callback(start);
                        finish = +new Date();
                        me.timeout = 1000 / 60 - (finish - start);
                    }, me.timeout);
                };
    })();

    /**
     * cancelAnimationFrame polyfill
     */
    ig.cancelAnimFrame = (function () {
        return root.cancelAnimationFrame
                || root.webkitCancelAnimationFrame
                || root.webkitCancelRequestAnimationFrame
                || root.mozCancelAnimationFrame
                || root.mozCancelRequestAnimationFrame
                || root.msCancelAnimationFrame
                || root.msCancelRequestAnimationFrame
                || root.oCancelAnimationFrame
                || root.oCancelRequestAnimationFrame
                || root.clearTimeout;
    })();

    /**
     * 空函数
     */
    ig.noop = function () {};

    /**
     * 为类型构造器建立继承关系
     *
     * @param {Function} subClass 子类构造器
     * @param {Function} superClass 父类构造器
     * @return {Function} 返回 subClass 构造器
     */
    ig.inherits = function (subClass, superClass) {
        ig.noop.prototype = superClass.prototype;
        var subProto = subClass.prototype;
        var proto = subClass.prototype = new ig.noop();

        for (var key in subProto) {
            proto[key] = subProto[key];
        }

        subClass.prototype.constructor = subClass;
        subClass.superClass = superClass.prototype;

        return subClass;
    };

    /**
     * 根据角度计算弧度
     * 弧度 = 角度 * Math.PI / 180
     *
     * @param {number} deg 角度值
     *
     * @return {number} 弧度值
     */
    ig.deg2Rad = function (deg) {
        return deg * Math.PI / 180;
    };

    /**
     * 根据弧度计算角度
     * 角度 = 弧度 * 180 / Math.PI
     *
     * @param {number} rad 弧度值
     *
     * @return {number} 角度值
     */
    ig.rad2Deg = function (rad) {
        return rad * 180 / Math.PI;
    };

    /**
     * 把页面上的鼠标坐标换成相对于 canvas 的坐标
     *
     * @param {HTML.Element} canvas canvas 元素
     * @param {number} x 相对于页面的横坐标
     * @param {number} y 相对于页面的纵坐标
     *
     * @return {Object} 相对于 canvas 的坐标对象
     */
    ig.window2Canvas = function (canvas, x, y) {
        var boundRect = canvas.getBoundingClientRect();
        return {
            x: Math.round(x - boundRect.left * (canvas.width / boundRect.width)),
            y: Math.round(y - boundRect.top * (canvas.height / boundRect.height))
        };
    };

})(root || this, ig || {});

/**
 * @file 自定义事件处理
 * @author ielgnaw(wuji0223@gmail.com)
 */

(function (root, ig, undefined) {

    var guidKey = '_observerGUID';

    /**
     * 提供与事件相关的操作的基类
     *
     * @constructor
     */
    function Event() {
        this._events = {};
    }

    /**
     * 注册一个事件处理函数
     *
     * @param {string} type 事件的类型，如果类型为`*`则在所有事件触发时执行
     * @param {Function} handler 事件的处理函数
     * @public
     */
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

    /**
     * 注销一个事件处理函数
     * @param {string} type 事件的类型，
     * 如果值为`*`仅会注销通过`*`为类型注册的事件，并不会将所有事件注销
     * @param {Function=} handler 事件的处理函数，
     * 无此参数则注销`type`指定类型的所有事件处理函数
     * @public
     */
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
                    // 当前Event实现去重是在`fire`阶段做的，
                    // 因此可能通过`on`注册多个相同的handler，
                    // 所以继续循环，不作退出处理
                    i--;
                }
            }
        }
    };

    /**
     * 触发指定类型的事件
     *
     * 事件处理函数的执行顺序如下：
     *
     * 1. 如果对象上存在名称为`on{type}`的方法，执行该方法
     * 2. 按照事件注册时的先后顺序，依次执行类型为`type`的处理函数
     * 3. 按照事件注册时的先后顺序，依次执行类型为`*`的处理函数
     *
     * 关于事件对象，分为以下2种情况：
     *
     * - 如果`event`参数是个对象，则会添加`type`属性后传递给处理函数
     * - 其它情况下，`event`参数的值将作为事件对象中的`data`属性
     *
     * 事件处理函数有去重功能，同一个事件处理函数只会执行一次
     *
     * @param {string=} type 事件类型
     * @param {Object=} event 事件对象
     * @public
     */
    Event.prototype.fire = function (type, event) {
        // `.fire({ type: click, data: 'data' })`这样的情况
        if (arguments.length === 1 && typeof type === 'object') {
            event = type;
            type = event.type;
        }

        // 无论`this._events`有没有被初始化，
        // 如果有直接挂在对象上的方法是要触发的
        var inlineHandler = this['on' + type];
        if (typeof inlineHandler === 'function') {
            inlineHandler.call(this, event);
        }

        if (!this._events) {
            return;
        }

        // 到了这里，有`.fire(type)`和`.fire(type, event)`两种情况
        if (event == null) {
            event = {};
        }
        if (Object.prototype.toString.call(event) !== '[object Object]') {
            event = {data: event};
        }
        event.type = type;
        event.target = this;

        var alreadyInvoked = {};
        var pool = this._events[type];
        if (pool) {
            // 由于在执行过程中，某个处理函数可能会用`un`取消事件的绑定，
            // 这可能导致循环过程中`i`的不准确，因此复制一份。
            // 这个策略会使得在事件处理函数中把后续的处理函数取消掉在当前无效。
            //
            // NOTICE: 这个性能不高，有空再改改
            pool = pool.slice();

            for (var i = 0; i < pool.length; i++) {
                var handler = pool[i];
                if (!alreadyInvoked.hasOwnProperty(handler[guidKey])) {
                    handler.call(this, event);
                }
            }
        }

        // 类型为`*`的事件在所有事件触发时都要触发
        if (type !== '*') {
            var allPool = this._events['*'];
            if (!allPool) {
                return;
            }

            allPool = allPool.slice();

            /* eslint-disable no-redeclare */
            for (var i = 0; i < allPool.length; i++) {
                var handler = allPool[i];
                if (!alreadyInvoked.hasOwnProperty(handler[guidKey])) {
                    handler.call(this, event);
                }
            }
            /* eslint-enable no-redeclare */
        }
    };

    /**
     * 在无继承关系的情况下，使一个对象拥有事件处理的功能
     *
     * @param {*} target 需要支持事件处理功能的对象
     */
    Event.enable = function (target) {
        target._events = {};
        target.on = Event.prototype.on;
        target.un = Event.prototype.un;
        target.fire = Event.prototype.fire;
    };

    ig.Event = Event;

})(root || this, ig || {});

/**
 * @file 图片加载
 * @author ielgnaw(wuji0223@gmail.com)
 */

(function (root, ig, undefined) {

    var arrayProto = Array.prototype;

    /**
     * 图片加载构造器
     *
     * @constructor
     */
    function ImageLoader() {
        this.images = {};
        this.imageUrls = [];
        this.imagesLoadedCount = 0;
        this.imagesErrorLoadedCount = 0;
        this.imageIndex = 0;
        this.imageLoadingProgressCallback = ig.noop;
    };

    ImageLoader.prototype.imageLoadedCallback = function () {
        this.imagesLoadedCount++;
    };

    ImageLoader.prototype.imageLoadedErrorCallback = function () {
        this.imagesErrorLoadedCount++;
    };

    ImageLoader.prototype.loadImage = function (imageUrl) {
        var me = this;
        var img = new Image();
        img.src = imageUrl;
        img.addEventListener('load', function (e) {
            me.imageLoadedCallback(e);
        });
        img.addEventListener('error', function (e) {
            me.imageLoadedErrorCallback(e);
        });

        me.images[imageUrl] = img;
    };

    ImageLoader.prototype.loadImages = function (imageUrl) {
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

    var il = new ImageLoader();

    // il.addImage('/examples/1/img/mute_35x35.png');
    // il.addImage('/examples/1/img/thinNumbers_25x32.png');
    // il.addImage('/examples/1/img/fatNumbers_33x41.png');
    // il.addImage('/examples/1/img/pop_156x141.png');
    // il.addImage('/examples/1/img/dots_64x86.png');
    // il.addImage('/examples/1/img/panels_383x550.png');
    // il.addImage('/examples/1/img/quitBut.png');
    // il.addImage('/examples/1/img/playBut.png');
    // il.addImage('/examples/1/img/hud.png');
    // il.addImage('/examples/1/img/rotateDeviceMessage.jpg');
    // il.addImage('/examples/1/img/bg.jpg');
    il.addImage([
        '/examples/1/img/mute_35x35.png',
        '/examples/1/img/thinNumbers_25x32.png',
        '/examples/1/img/fatNumbers_33x41.png',
        '/examples/1/img/pop_156x141.png',
        '/examples/1/img/dots_64x86.png',
        '/examples/1/img/panels_383x550.png',
        '/examples/1/img/quitBut.png',
        '/examples/1/img/playBut.png',
        '/examples/1/img/hud.png',
        '/examples/1/img/rotateDeviceMessage.jpg',
        '/examples/1/img/bg.jpg'
    ]);

    var interval = setInterval(function (e) {
        var percentComplete = il.loadImages();
        console.warn(il);
        console.warn(percentComplete.toFixed());

        if (percentComplete >= 100) {
            clearInterval(interval)
        }
    }, 16);



    ig.inherits(ImageLoader, ig.Event);

    // var a = new ImageLoader();
    // a.on('test', function () {
    //     console.error(arguments);
    // });
    // a.fire('test', {s: 1});
    // console.warn(a);
    ig.ImageLoader = ImageLoader;

})(root || this, ig || {});

/**
 * @file 平台检测
 * @author ielgnaw(wuji0223@gmail.com)
 */

(function (root, ig, undefined) {

    /**
     * ua 探测
     * from saber-env
     *
     * @param {string} ua navigator.userAgent
     * @return {Object}
     */
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
        var chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match( /CriOS\/([\d.]+)/);
        var firefox = ua.match(/Firefox\/([\d.]+)/);
        var ie = ua.match(/MSIE\s([\d.]+)/) || ua.match( /Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/);

        var webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/);
        var safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/);

        var wechat = ua.match(/MicroMessenger\/([\d.]+)/);
        var baidu = ua.match(/baiduboxapp\/[^\/]+\/([\d.]+)_/)
            || ua.match(/baiduboxapp\/([\d.]+)/)
            || ua.match(/BaiduHD\/([\d.]+)/)
            || ua.match(/FlyFlow\/([\d.]+)/)
            || ua.match(/baidubrowser\/([\d.]+)/);
        var qq = ua.match(/MQQBrowser\/([\d.]+)/)
            || ua.match(/QQ\/([\d.]+)/);
        var uc = ua.match(/UCBrowser\/([\d.]+)/);
        var sogou = ua.match(/SogouMobileBrowser\/([\d.]+)/);
        var xiaomi = android && ua.match(/MiuiBrowser\/([\d.]+)/);
        var liebao = ua.match(/LBKIT/);
        var mercury = ua.match(/Mercury\/([\d.]+)/);

        // Todo: clean this up with a better OS/browser seperation:
        // - discern (more) between multiple browsers on android
        // - decide if kindle fire in silk mode is android or not
        // - Firefox on Android doesn't specify the Android version
        // - possibly devide in os, device and browser hashes

        if ((browser.webkit = !!webkit)) {
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

        os.tablet = !!(
            ipad
            || playbook
            || (android && !ua.match(/Mobile/))
            || (firefox && ua.match(/Tablet/))
            || (ie && !ua.match(/Phone/) && ua.match(/Touch/))
        );
        os.phone = !!(
            !os.tablet
            && !os.ipod
            && (android
                || iphone
                || webos
                || blackberry
                || bb10
                || (chrome && ua.match(/Android/))
                || (chrome && ua.match(/CriOS\/([\d.]+)/))
                || (firefox && ua.match(/Mobile/))
                || (ie && ua.match(/Touch/))
            )
        );

        return {
            browser: browser,
            os: os
        };
    }

    var platform = detect(navigator.userAgent);

    ig.env = {
        browser: platform.browser,
        os: platform.os,
        supportOrientation: (typeof root.orientation == 'number' && typeof root.onorientationchange == 'object'),
        supportTouch: ('ontouchstart' in root) || root.DocumentTouch && document instanceof DocumentTouch
    };
})(root || this, ig || {});

    return ig;
});
