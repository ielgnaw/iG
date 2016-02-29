'use strict';

/* global ig */

window.onload = function () {

    var canvas = document.querySelector('#canvas');

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

    // ig.setConfig('fps', 1);
    // console.warn(ig.getConfig('fps'));
    // console.warn(ig.getConfig('dt'));

    var game = new ig.Game({
        canvas: canvas,
        name: 'test-game',
        maximize: 1,
        resource: [
        ]
    }).on('loadResProcess', function (e) {
    }).on('loadResDone', function (e) {
    });

    function create(fps, y) {
        return new Circle({
            x: 15,
            y: y,
            vx: 1.5,
            vy: 0,
            ax: 1,
            ay: 0,
            radius: 15,
            ctx: canvas.getContext('2d'),
            fps: fps
        });
    }

    // var circle60 = create(60, 20);
    var circle5 = create(5, 40);

    // game.add(circle60);
    game.add(circle5);

    var node60 = document.querySelector('#fps60 span');
    var node5 = document.querySelector('#fps5 span');

    game.start(function (dt, realDelta) {
        // circle60.step(dt);
        circle5.step(dt);
    }, function (dt, realDelta) {
        // node60.innerHTML = Math.floor(1000 / (realDelta));
        node5.innerHTML = Math.floor(1000 / (realDelta));
        // circle60.draw();
        circle5.draw();
    }, ig.getConfig('fps'), '1-loopId');

    setTimeout(function () {
        game.stop();
    }, 20000)

    // create(5, 0);
    // // create(10, 1);
    // // create(20, 2);
    // // create(30, 3);
    // // create(40, 4);
    // // create(50, 5);
    // create(60, 6);


};