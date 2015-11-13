'use strict';

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

    function moveDivTimeBasedImprove(div, fps) {
        var left = 0;
        var current = +new Date;
        var previous = +new Date;
        var dt = 1000 / 60;
        var acc = 0;
        var param = 1;

        function loop() {
            var current = +new Date;
            var passed = current - previous;
            previous = current;
            acc += passed;
            while (acc >= dt) {
                update(dt);
                acc -= dt;
            }
            draw();
        }

        function update(dt) {
            left += param * (dt * 0.1);
            if (left > 270) {
                left = 270;
                param = -1;
            } else if (left < 0) {
                left = 0;
                param = 1;
            }
        }

        function draw() {
            div.style.left = left + 'px';
        }

        // setInterval(loop, 1000 / fps);
        requestTimeout(function (delta) {
            loop();
        }, 1000 / fps);

    }

    moveDivTimeBasedImprove(document.getElementById('div7'), 60);
    moveDivTimeBasedImprove(document.getElementById('div8'), 30);
    moveDivTimeBasedImprove(document.getElementById('div9'), 10);

}
