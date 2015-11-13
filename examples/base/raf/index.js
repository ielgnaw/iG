// 'use strict';

/* global ig */

window.onload = function () {
    (function () {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame
                = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    })();

    window.requestTimeout = function (fn, delay) {
        if (!delay) {
            delay = 0;
        }

        var start = new Date().getTime();
        var handle = {};

        function loop() {
            handle.value = requestAnimationFrame(loop);
            var last = 0;
            var current = new Date().getTime();
            var delta = current - start;
            if(delta >= delay) {
                fn.call(null, delta);
                start = new Date().getTime();
            }
        };

        handle.value = requestAnimationFrame(loop);
        return handle;
    };

    /**
     * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
     * @param {int|object} fn The callback function
     */
    window.clearRequestTimeout = function (handle) {
        if (!handle) {
            return;
        }
        if (typeof handle === 'object') {
            window.cancelAnimationFrame(handle.value);
        }
        else {
            window.cancelAnimationFrame(handle);
        }
    };

    var timer;
    document.querySelector('#start').addEventListener('click', function (e) {
        clearRequestTimeout(timer);
        timer = requestTimeout(function (delta) {
            document.querySelector('#fps').innerHTML = Math.floor(1000 / (delta));
            console.warn(delta, Math.floor(1000 / (delta)));
            if (timer.value > 1500) {
                clearRequestTimeout(timer);
            }
        }, document.querySelector('#f').value);
    });
}
