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
                }
    })();

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
                || root.clearTimeout
    })();

    // console.warn(root);
    // console.warn(ig);
    ig.aaa = 1;
    return ig;
});

