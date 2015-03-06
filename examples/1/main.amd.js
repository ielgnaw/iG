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
        console.log(ig.env);
        var designWidth = 414;
        var designHeight = 736;
        var viewWidth = document.documentElement.clientWidth;
        var viewHeight = document.documentElement.clientHeight;
        var scale = viewWidth / designWidth;
        canvas.width = designWidth;
        canvas.height = viewHeight / scale;
        canvas.style.width = viewWidth + 'px';
        canvas.style.height = viewHeight + 'px';

        // var devicePixelRatio = window.devicePixelRatio || 1;

        // var backingStoreRatio = ctx.webkitBackingStorePixelRatio
        //     || ctx.mozBackingStorePixelRatio
        //     || ctx.msBackingStorePixelRatio
        //     || ctx.oBackingStorePixelRatio
        //     || ctx.backingStorePixelRatio
        //     || 1;

        // var ratio = devicePixelRatio / backingStoreRatio;
        // console.warn(ratio);

        // if (devicePixelRatio !== backingStoreRatio) {
        //     var oldWidth = canvas.width;
        //     var oldHeight = canvas.height;

        //     canvas.width = oldWidth * ratio;
        //     canvas.height = oldHeight * ratio;

        //     canvas.style.width = oldWidth + 'px';
        //     canvas.style.height = oldHeight + 'px';

        //     ctx.scale(ratio, ratio);
        //     console.warn(ctx);
        // }

        ctx.fillRect(0, 0, canvas.width, canvas.height);


    };

    return exports;

});
