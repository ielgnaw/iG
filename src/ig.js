/**
 * @file 主入口文件
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    /* global ig */

    /**
     * requestAnimationFrame polyfill
     */
    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.msRequestAnimationFrame
            || window.oRequestAnimationFrame
            || function (callback, elem) {
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
    })();

    /**
     * cancelAnimationFrame polyfill
     */
    window.cancelAnimationFrame = (function () {
        return window.cancelAnimationFrame
                || window.webkitCancelAnimationFrame
                || window.webkitCancelRequestAnimationFrame
                || window.mozCancelAnimationFrame
                || window.mozCancelRequestAnimationFrame
                || window.msCancelAnimationFrame
                || window.msCancelRequestAnimationFrame
                || window.oCancelAnimationFrame
                || window.oCancelRequestAnimationFrame
                || window.clearTimeout;
    })();

    window.addEventListener('DOMContentLoaded', init, false);

    var exports = {};

    exports.fitScreen = function (canvas, parentContainer) {
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

        if (ig.env.isMobile) {
            if (window.innerWidth > window.innerHeight) {
                if (innerWidth / canvas.width < innerHeight / canvas.height) {
                    canvas.style.width = innerWidth + 'px';
                    canvas.style.height = innerWidth / canvas.width * canvas.height + 'px';
                    canvasX = 0;
                    canvasY = (innerHeight - innerWidth / canvas.width * canvas.height) / 2;
                    canvasScaleX = canvasScaleY = canvas.width / innerWidth;
                    parentContainer.style.marginTop = canvasY + 'px';
                    parentContainer.style.marginLeft = canvasX + 'px';
                }
                else {
                    canvas.style.width = innerHeight / canvas.height * canvas.width + 'px';
                    canvas.style.height = innerHeight + 'px';
                    canvasX = (innerWidth - innerHeight / canvas.height * canvas.width) / 2;
                    canvasY = 0;
                    canvasScaleX = canvasScaleY = canvas.height / innerHeight;
                    parentContainer.style.marginTop = canvasY + 'px';
                    parentContainer.style.marginLeft = canvasX + 'px';
                }
            }
            else {
                canvasX = canvasY = 0;
                canvasScaleX = canvas.width / innerWidth;
                canvasScaleY = canvas.height / innerHeight;
                canvas.style.width = innerWidth + 'px';
                canvas.style.height = innerHeight + 'px';
                parentContainer.style.marginTop = '0px';
                parentContainer.style.marginLeft = '0px';
            }
        }
        else {
            if (innerWidth / canvas.width < innerHeight / canvas.height) {
                canvas.style.width = innerWidth + 'px';
                canvas.style.height = innerWidth / canvas.width * canvas.height + 'px';
                canvasX = 0;
                canvasY = (innerHeight - innerWidth / canvas.width * canvas.height) / 2;
                canvasScaleX = canvasScaleY = canvas.width / innerWidth;
                parentContainer.style.marginTop = canvasY + 'px';
                parentContainer.style.marginLeft = canvasX + 'px';
            }
            else {
                canvas.style.width = innerHeight / canvas.height * canvas.width + 'px';
                canvas.style.height = innerHeight + 'px';
                canvasX = (innerWidth - innerHeight / canvas.height * canvas.width) / 2;
                canvasY = 0;
                canvasScaleX = canvasScaleY = canvas.height / innerHeight;
                parentContainer.style.marginTop = canvasY + 'px';
                parentContainer.style.marginLeft = canvasX + 'px';
            }
        }

        // console.log(canvasX, canvasY, canvasScaleX, canvasScaleY);
    };

    function init() {
        var canvas = document.querySelector('#canvas');
        canvas.width = 383;
        canvas.height = 550;
        var parentContainer = document.querySelector('.container');
        // console.warn(ig.env);
        setTimeout(function () {
            exports.fitScreen(canvas, parentContainer);
        }, 0);

        // exports.fitScreen();

        window.addEventListener('resize', function () {
            setTimeout(function() {
                exports.fitScreen(canvas, parentContainer);
            }, 1);
        }, false);

        window.addEventListener('orientationchange', function () {
            exports.fitScreen(canvas, parentContainer);
        }, false);
    }

    return exports;

});
