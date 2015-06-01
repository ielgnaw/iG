'use strict';

/* global ig */

window.onload = function () {
    var gameFps = 100;

    function Circle(opts) {
        this.x = opts.x;
        this.y = opts.y;
        this.vx = opts.vx;
        this.vy = opts.vy;
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

    Circle.prototype.update = function (dt) {
        this.x += this.vx * dt * this.fps / 1000;
        this.y += this.vy * dt * this.fps / 1000;

        if (this.x - this.radius <= 0 || this.x + this.radius >= this.ctx.canvas.width) {
            this.vx = -this.vx;
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= this.ctx.canvas.height) {
            this.vy = -this.vy;
        }
    }

    var circle = new Circle({
        x: 15,
        y: 30,
        vx: 10,
        vy: 0,
        radius: 15,
        ctx: document.querySelector('#time-based-canvas').getContext('2d'),
        fps: gameFps
    });

    document.querySelector('#time-based-start').onclick = function () {
        ig.loop({
            update: function (dt) {
                circle.update(dt);
            },
            render: function () {
                circle.draw();
                // console.warn('render');
            },
            ticksPerFrame: 0
        });
    }
}
