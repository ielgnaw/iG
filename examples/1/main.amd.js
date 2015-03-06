/**
 * @file Description
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var ig = require('ig');

    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');

    function resize() {

    }

    var exports = {};

    exports.init = function () {
        console.warn(backingStoreRatio);
        console.log(require('ig'));
        var designWidth = 640;
        var designHeight = 1136;
        var viewWidth = document.documentElement.clientWidth;
        var viewHeight = document.documentElement.clientHeight;
        var scale = viewWidth / designWidth;
        canvas.width = designWidth;
        canvas.height = viewHeight / scale;
        canvas.style.width = viewWidth + 'px';
        canvas.style.height = viewHeight + 'px';

        var devicePixelRatio = window.devicePixelRatio || 1;

        var backingStoreRatio = ctx.webkitBackingStorePixelRatio
            || ctx.mozBackingStorePixelRatio
            || ctx.msBackingStorePixelRatio
            || ctx.oBackingStorePixelRatio
            || ctx.backingStorePixelRatio
            || 1;

        var ratio = devicePixelRatio / backingStoreRatio;
        console.warn(ratio);

        if (devicePixelRatio !== backingStoreRatio) {
            var oldWidth = canvas.width;
            var oldHeight = canvas.height;

            canvas.width = oldWidth * ratio;
            canvas.height = oldHeight * ratio;

            canvas.style.width = oldWidth + 'px';
            canvas.style.height = oldHeight + 'px';

            // now scale the context to counter
            // the fact that we've manually scaled
            // our canvas element
            context.scale(ratio, ratio);
        }
    };

    return exports;

});
