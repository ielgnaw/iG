'use strict';

/* global ig */

window.onload = function () {
    var gameFps = 60;

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
        // console.warn(this.x);
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        this.ctx.fill();
    };

    Circle.prototype.step = function (dt) {
        // this.x += this.vx * dt * this.fps / 1000;
        // this.y += this.vy * dt * this.fps / 1000;

        this.vx += this.ax * dt;// * (this.fps / 1000);
        this.vy += this.ay * dt;// * (this.fps / 1000);

        // 60 fps 即每秒 60 帧，每帧移动一个单位距离，那么每秒移动 60 个单位距离，那么每毫秒移动 60/1000 个单位距离
        this.x += this.vx * dt;// * (this.fps / 1000);
        this.y += this.vy * dt;// * (this.fps / 1000);

        if (this.x - this.radius <= 0 || this.x + this.radius >= this.ctx.canvas.width) {
            this.vx = -this.vx;
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= this.ctx.canvas.height) {
            this.vy = -this.vy;
        }
    }

    var canvas = document.querySelector('#time-based-canvas');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    var circle = new Circle({
        x: 15,
        y: 30,
        vx: 10,
        vy: 0,
        ax: 0,
        ay: 0,
        radius: 15,
        ctx: document.querySelector('#time-based-canvas').getContext('2d'),
        fps: gameFps
    });

    document.querySelector('#time-based-start').onclick = function () {
        ig.loop({
            step: function (dt) {
                circle.step(dt);
            },
            render: function () {
                circle.draw();
            },
            ticksPerFrame: 0
        });
    }
}
