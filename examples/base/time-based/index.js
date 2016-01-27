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
            handle.value = window.requestAnimationFrame(loop);
            var current = new Date().getTime();
            var delta = current - start;
            if (delta >= delay) {
                fn.call(null, delta);
                start = new Date().getTime();
            }
        }

        handle.value = window.requestAnimationFrame(loop);
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

    var dt = 1000 / 60;

    function Circle(opts) {
        this.x = opts.x;
        this.y = opts.y;
        this.vx = opts.vx;
        this.vy = opts.vy;
        this.ax = opts.ax;
        this.ay = opts.ay;
        this.radius = opts.radius;
        this.ctx = opts.ctx;
        this.fps = opts.fps;

        // this.previous = +new Date();
        // this.dt = 1000 / 60;
        // this.accumulateTime = 0;
    }

    Circle.prototype.draw = function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        this.ctx.fill();
    };

    Circle.prototype.step = function (dt) {
        this.x += this.vx ;// * 0.1;
        this.y += this.vy ;// * 0.1;

        if (this.x - this.radius <= 0 || this.x + this.radius >= this.ctx.canvas.width) {
            this.vx = -this.vx;
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= this.ctx.canvas.height) {
            this.vy = -this.vy;
        }
    };

    // Circle.prototype.loop = function () {
    //     var current = +new Date();
    //     var passed = current - this.previous;
    //     this.previous = current;
    //     this.accumulateTime += passed;
    //     while (this.accumulateTime >= this.dt) {
    //         // console.warn(this.dt);
    //         this.step(this.dt);
    //         this.accumulateTime -= this.dt;
    //     }
    //     this.draw();
    // };

    console.warn(ig.util.getTimestamp());

    function create(ident) {
        var canvas = document.querySelector('#fps' + ident + '-canvas');
        var circle = new Circle({
            x: 15,
            y: 20,
            vx: 1.5,
            vy: 0,
            ax: 1,
            ay: 0,
            radius: 15,
            ctx: canvas.getContext('2d'),
            fps: ident
        });
        circle.previous = +new Date();
        circle.accumulateTime = 0;
        window.requestTimeout(function (delta) {
            document.querySelector('#fps' + ident + ' span').innerHTML = Math.floor(1000 / (delta));
            // circle.loop();

            var current = +new Date();
            var passed = current - circle.previous;
            circle.previous = current;
            circle.accumulateTime += passed;
            while (circle.accumulateTime >= dt) {
                circle.step(dt);
                circle.accumulateTime -= dt;
            }
            circle.draw();

        }, 1000 / circle.fps);
    }

    create(5);
    create(10);
    create(20);
    create(30);
    create(40);
    create(50);
    create(60);

};
