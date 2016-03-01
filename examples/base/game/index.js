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
        this.name = opts.name || String(ig.util.getTimestamp());

        this.cacheCanvas = document.createElement('canvas');
        this.cacheCtx = this.cacheCanvas.getContext('2d');
        this.cacheCanvas.width = 2 * this.radius;
        this.cacheCanvas.height = 2 * this.radius;

        this.cache();
    }

    Circle.prototype.cache = function () {
        this.cacheCtx.save();
        this.cacheCtx.beginPath();
        // this.cacheCtx.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2, true);
        this.cacheCtx.arc(0 + this.radius, 0 + this.radius, this.radius, 0, Math.PI * 2, true);
        this.cacheCtx.fill();
        this.cacheCtx.restore();
    }

    Circle.prototype.draw = function () {
        // this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(this.cacheCanvas, this.x - this.radius , this.y - this.radius);
        // this.ctx.clearRect(this.x - this.radius * 2, this.y - this.radius, this.radius * 2, this.radius * 2);
        // this.ctx.beginPath();
        // this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        // this.ctx.fill();
    };

    Circle.prototype.step = function (dt) {
        this.ctx.clearRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);

        this.x += this.vx ;// * 0.1;
        this.y += this.vy ;// * 0.1;

        if (this.x - this.radius <= 0 || this.x + this.radius >= this.ctx.canvas.width) {
            this.vx = -this.vx;
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= this.ctx.canvas.height) {
            this.vy = -this.vy;
        }
    };

    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');

    function create(fps, y) {
        return new Circle({
            x: 15 * 3,
            y: y * 3,
            vx: 2 * 3,
            vy: 0 * 3,
            ax: 1 * 3,
            ay: 0 * 3,
            radius: 15 * 3,
            ctx: ctx,
            fps: fps
        });
    }

    var circle60 = create(60, 20);
    var circle30 = create(30, 70);
    var circle10 = create(10, 120);
    var circle5 = create(5, 170);

    var node60 = document.querySelector('#fps60 span');
    var node30 = document.querySelector('#fps30 span');
    var node10 = document.querySelector('#fps10 span');
    var node5 = document.querySelector('#fps5 span');

    var game = new ig.Game({
        canvas: canvas,
        // fps: 10,
        maximize: 1,
        width: 300,
        // height: 100
    });

    // game.add(circle60);
    game.add(circle5);

    game.start(function (dt, realDelta) {
        // circle60.step(dt);
        circle5.step(dt);
    }, function (dt, realDelta) {
        // node60.innerHTML = Math.floor(1000 / (realDelta));
        // node5.innerHTML = Math.floor(1000 / (realDelta));
        // circle60.draw();
        circle5.draw();
    }, ig.getConfig('fps'));

    setTimeout(function () {
        game.stop();
    }, 20000)
};