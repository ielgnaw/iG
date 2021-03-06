/**
 * @file 系统环境检测
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var ig = require('./ig');

    /**
     * ua 探测
     * from saber-env
     *
     * @param {string} ua navigator.userAgent
     * @return {Object}
     */
    /* eslint-disable fecs-max-statements */
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
    /* eslint-enable fecs-max-statements */

    /**
     * 检测音频支持
     * from Phaser
     * developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
     * bit.ly/iphoneoscodecs
     *
     * @param {Object} exp 模块导出对象
     */
    function checkAudio(exp) {
        exp.audioData = !!(window.Audio);
        exp.webAudio = !!(window.AudioContext || window.webkitAudioContext);

        if (exp.webAudio) {
            if (typeof window.AudioContext !== 'undefined') {
                ig.audioContext = new window.AudioContext();
            }
            else {
                /* eslint-disable new-cap */
                ig.audioContext = new window.webkitAudioContext();
                /* eslint-enable new-cap */
            }
        }

        var audioElement = document.createElement('audio');
        // var result = false;
        try {
            /* jshint boss:true */
            // if (result = !!audioElement.canPlayType) {
            if (audioElement.canPlayType) {
                if (audioElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')) {
                    exp.ogg = true;
                }

                if (audioElement.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '')
                    || audioElement.canPlayType('audio/opus;').replace(/^no$/, '')
                ) {
                    exp.opus = true;
                }

                if (audioElement.canPlayType('audio/mpeg;').replace(/^no$/, '')) {
                    exp.mp3 = true;
                }

                if (audioElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '')) {
                    exp.wav = true;
                }

                if (audioElement.canPlayType('audio/x-m4a;')
                    || audioElement.canPlayType('audio/aac;').replace(/^no$/, '')
                ) {
                    exp.m4a = true;
                }

                if (audioElement.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')) {
                    exp.webm = true;
                }
            }
        }
        catch (e) { }
    }

    /**
     * 获取设备像素比
     *
     * @return {number} 设备像素比
     */
    var dpr = (function () {
        var tmpCtx = document.createElement('canvas').getContext('2d');
        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = tmpCtx.backingStorePixelRatio
            || tmpCtx.webkitBackingStorePixelRatio
            || tmpCtx.mozBackingStorePixelRatio
            || tmpCtx.msBackingStorePixelRatio
            || tmpCtx.oBackingStorePixelRatio
            || tmpCtx.backingStorePixelRatio
            || 1;

        var ratio = 1;
        if (devicePixelRatio !== backingStoreRatio) {
            ratio = devicePixelRatio / backingStoreRatio;
        }
        return ratio;
    })();

    var isSupportLocalStorage = (function () {
        try {
            var support = 'localStorage' in window && window.localStorage !== null;

            var test = {
                k: 'test key',
                v: 'test value'
            };
            if (support) {
                localStorage.setItem(test.k, test.v);
                support = test.v === localStorage.getItem(test.k);
                localStorage.removeItem(test.k);
            }
            return support;
        }
        catch (e) {
            return false;
        }
    })();

    var env = detect(navigator.userAgent);

    var exports = {
        browser: env.browser,
        os: env.os,
        supportOrientation: (typeof window.orientation === 'number' && typeof window.onorientationchange === 'object'),
        supportTouch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch,
        supportGeolocation: (navigator.geolocation != null),
        supportLocalStorage: isSupportLocalStorage,
        isAndroid: env.os.android,
        isIOS: env.os.ios,
        isPhone: env.os.phone,
        isTablet: env.os.tablet,
        isMobile: env.os.phone || env.os.tablet,
        dpr: dpr
    };

    checkAudio(exports);

    return exports;

});
