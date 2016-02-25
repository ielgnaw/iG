'use strict';

/* global ig */

window.onload = function () {

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
        // circle.previous = +new Date();
        // circle.accumulateTime = 0;
        var q = ig.loop({
            step: function (dt, realDelta) {
                circle.step(dt);
            },
            exec: function (dt, realDelta) {
                document.querySelector('#fps' + fps + ' span').innerHTML = Math.floor(1000 / (realDelta));
                circle.draw();
            },
            fps: fps,
            loopId: 'mainReq' + loopId
        })

        setTimeout(function () {
            if (q.loopId === 'mainReq3') {
                console.warn('over');
                window.clearRequestTimeout(q.reqId, q.loopId);
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

};
