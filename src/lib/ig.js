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
     * core.js
     *
     * @param {Object} root 上下文根，浏览器环境是 window
     * @param {Object} ig ig 对象
     * @param {undefined} undefined undefined
     */
    (function (root, ig, undefined) {

        /**
         * requestAnimationFrame polyfill
         */
        root.requestAnimFrame = (function () {
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
        root.cancelAnimFrame = (function () {
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
         * UserAgent Detect
         *
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
            os: platform.os
        };

        // console.log(detect(navigator.userAgent).browser);
        // console.log(detect(navigator.userAgent).os);

        // for (var i in detect(navigator.userAgent)) {
        //     alert(111 + '---' + i + '---' + detect(navigator.userAgent)[i]);
        //     for (var j in detect(navigator.userAgent)[i]) {
        //         alert(222 + '---' + j + '---' + detect(navigator.userAgent)[i][j])
        //     }
        // }

        var Empty = function () {};

        /**
         * 为类型构造器建立继承关系
         *
         * @param {Function} subClass 子类构造器
         * @param {Function} superClass 父类构造器
         * @return {Function} 返回 subClass 构造器
         */
        ig.inherits = function (subClass, superClass) {
            Empty.prototype = superClass.prototype;
            var subPrototype = subClass.prototype;
            var proto = subClass.prototype = new Empty();

            for (var key in subPrototype) {
                proto[key] = subPrototype[key];
            }

            subClass.prototype.constructor = subClass;
            subClass.superClass = superClass.prototype;

            return subClass;
        };

    })(root || this, ig || {});

    /**
     * PlatformDetect.js
     *
     * @param {Object} root 上下文根，浏览器环境是 window
     * @param {Object} ig ig 对象
     * @param {undefined} undefined undefined
     */
    (function (root, ig, undefined) {

        /**
         * UserAgent Detect
         *
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
            os: platform.os
        };

    })(root || this, ig || {});

    (function (ig) {
        console.warn(ig);
    })(ig || {});

    return ig;
});

