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
    }

    Circle.prototype.draw = function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        this.ctx.fill();
    };

    Circle.prototype.step = function (dt) {
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;

        // 60 fps 即每秒 60 帧，每帧移动一个单位距离，那么每秒移动 60 个单位距离，那么每毫秒移动 60/1000 个单位距离
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.x - this.radius <= 0 || this.x + this.radius >= this.ctx.canvas.width) {
            this.vx = -this.vx;
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= this.ctx.canvas.height) {
            this.vy = -this.vy;
        }
    }

    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    var circle;
    resetCircle();

    function resetCircle() {
        circle = null;
        circle = new Circle({
            x: 100,
            y: 30,
            vx: 10,
            vy: 0,
            ax: 0,
            ay: 0,
            radius: 15,
            ctx: ctx
        });
        circle.draw();
    }

    var anim;
    document.querySelector('#simple').onclick = function () {
        resetCircle();
        if (anim) {
            anim.destroy();
        }
        anim = new ig.Animation({
            source: circle,
            target: {
                x: 201
            },
            jumpFrames: 1
        });
        anim.play().on('step', function (e) {
            circle.x = e.data.source.x;
            circle.draw();
        }).on('complete', function (e) {
            // console.warn(e.data.source);
            console.warn('all complete');
            console.warn('\n');
        });
    }
    document.querySelector('#simple-repeat').onclick = function () {
        resetCircle();
        if (anim) {
            anim.destroy();
        }
        anim = new ig.Animation({
            source: circle,
            repeat: 1,
            target: {
                x: 200
            },
            jumpFrames: 0
        });
        anim.play().on('step', function (e) {
            circle.x = e.data.source.x;
            circle.draw();
        }).on('repeat', function (e) {
        });

        // ig.loop({
        //     step: function (dt, requestID) {
        //         // console.error(requestID);
        //     },
        //     render: function () {
        //     },
        //     jumpFrames: 0
        // });

        // setTimeout(function () {
        //     console.warn('stop');
        //     anim.stop();
        // }, 3000);
    }
    document.querySelector('#anims').onclick = function () {
        resetCircle();
        if (anim) {
            anim.destroy();
        }
        anim = new ig.Animation({
            source: circle,
            target: [
                {
                    x: 200
                },
                {
                    y: 100
                }
            ]
        });
        anim.play().on('step', function (e) {
            circle.x = e.data.source.x;
            circle.draw();
        }).on('groupComplete', function (e) {
        }).on('complete', function (e) {
            console.warn('all complete');
        });
    }
    document.querySelector('#anims-repeat').onclick = function () {
        resetCircle();
        if (anim) {
            anim.destroy();
        }
        anim = new ig.Animation({
            source: circle,
            repeat: 1,
            target: [
                {
                    x: 200
                },
                {
                    y: 100
                }
            ]
        });
        anim.play().on('step', function (e) {
            circle.x = e.data.source.x;
            circle.draw();
        }).on('groupComplete', function (e) {
        }).on('repeat', function (e) {
        });
    }
    document.querySelector('#range').onclick = function () {
        resetCircle();
        if (anim) {
            anim.destroy();
        }
        anim = new ig.Animation({
            source: circle,
            range: {
                x: circle.x + 10,
                y: 10
            }
        });
        anim.play().on('step', function (e) {
            circle.x = e.data.source.x;
            circle.draw();
        }).on('repeat', function (e) {
        });
    }
    document.querySelector('#range-repeat').onclick = function () {
        resetCircle();
        if (anim) {
            anim.destroy();
        }
        anim = new ig.Animation({
            source: circle,
            repeat: 1,
            range: {
                x: 30,
                y: 10
            }
        });
        anim.play().on('step', function (e) {
            circle.x = e.data.source.x;
            circle.draw();
        }).on('repeat', function (e) {
        });
    }
};
