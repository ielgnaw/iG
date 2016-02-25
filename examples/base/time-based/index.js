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

    window.requestTimeout = function (fn, delay, loopId) {
        if (!delay) {
            delay = 0;
        }

        if (!loopId) {
            loopId = String(ig.util.getTimestamp());
        }

        var start = new Date().getTime();

        var handle = {
            loopId: loopId
        };

        function loop() {
            handle.reqId = window.requestAnimationFrame(loop);
            var current = new Date().getTime();
            var delta = current - start;
            if (delta >= delay) {
                fn.call(null, delta);
                start = new Date().getTime();
            }
        }

        handle.reqId = window.requestAnimationFrame(loop);
        return handle;
    };

    // window.clearRequestTimeout = function (handle) {
    //     if (!handle) {
    //         return;
    //     }
    //     if (typeof handle === 'object') {
    //         window.cancelAnimationFrame(handle.reqId);
    //     }
    //     else {
    //         window.cancelAnimationFrame(handle);
    //     }
    // };

    window.clearRequestTimeout = function (reqId) {
        if (!reqId) {
            return;
        }
        window.cancelAnimationFrame(reqId);
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
        // console.warn(dt);
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

    // console.warn(ig.util.getTimestamp());

    function create(fps, loopId) {
        var canvas = document.querySelector('#fps' + fps + '-canvas');
        var circle = new Circle({
            x: 15,
            y: 20,
            vx: 1.5,
            vy: 0,
            ax: 1,
            ay: 0,
            radius: 15,
            ctx: canvas.getContext('2d'),
            fps: fps
        });
        circle.previous = +new Date();
        circle.accumulateTime = 0;

        var q = window.requestTimeout(function (delta) {
            document.querySelector('#fps' + fps + ' span').innerHTML = Math.floor(1000 / (delta));
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
        }, 1000 / circle.fps, 'mainReq' + loopId);

        // setInterval(function () {
        //     console.warn(q);
        // }, 3000);

        setTimeout(function () {
            if (q.loopId === 'mainReq3') {
                console.warn('over');
                window.clearRequestTimeout(q.reqId);
            }
        }, 6000);
    }

    // create(5, 0);
    // create(10, 1);
    // create(20, 2);
    // create(30, 3);
    // create(40, 4);
    // create(50, 5);
    create(60, 6);

    console.warn(ig);
    var q = new ig.Queue();
    q.enqueue('s2');
    q.enqueue('s1');
    q.enqueue('s3', 2);
    q.enqueue('s4', 1);
    q.enqueue('s8', 1);
    q.enqueue('s5', 1);
    q.enqueue('s6', 2);
    q.enqueue('s7', 2);
    q.print();
    console.warn(q.head());
    console.warn(q.tail());
    console.warn(q.max());
    console.warn(q.size());
    console.warn(q.isEmpty());
    console.warn('--------------');
    q.clear();
    console.warn(q.isEmpty());
    console.warn(q.head());
    console.warn(q.tail());
    console.warn(q.max());
    console.warn(q.size());
};
