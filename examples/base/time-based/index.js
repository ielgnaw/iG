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

        // this.current = +new Date;
        this.previous = +new Date;
        this.dt = 1000 / 60;
        this.accumulateTime = 0;
    }

    Circle.prototype.draw = function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        this.ctx.fill();
    };

    Circle.prototype.step = function (dt) {
        this.x += this.vx * dt * 0.1;
        this.y += this.vy * dt * 0.1;

        if (this.x - this.radius <= 0 || this.x + this.radius >= this.ctx.canvas.width) {
            this.vx = -this.vx;
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= this.ctx.canvas.height) {
            this.vy = -this.vy;
        }
    };

    Circle.prototype.loop = function () {
        var current = +new Date;
        var passed = current - this.previous;
        this.previous = current;
        this.accumulateTime += passed;
        while (this.accumulateTime >= this.dt) {
            this.step(this.dt);
            this.accumulateTime -= this.dt;
        }
        this.draw();
    };

    console.warn(ig.util.getTimestamp());

    function create(ident) {
        var canvas = document.querySelector('#fps' + ident + '-canvas');
        var circle = new Circle({
            x: 15,
            y: 20,
            vx: 1,
            vy: 0,
            ax: 1,
            ay: 0,
            radius: 15,
            ctx: canvas.getContext('2d'),
            fps: ident
        });
        requestTimeout(function (delta) {
            document.querySelector('#fps' + ident + ' span').innerHTML = Math.floor(1000 / (delta));
            circle.loop();
        }, 1000 / circle.fps);
    }

    create(5);
    create(10);
    create(20);
    create(30);
    create(40);
    create(50);
    create(60);

    // var canvas5 = document.querySelector('#fps5-canvas');
    // var circle5 = new Circle({
    //     x: 15,
    //     y: 20,
    //     vx: 1,
    //     vy: 0,
    //     ax: 1,
    //     ay: 0,
    //     radius: 15,
    //     ctx: canvas5.getContext('2d'),
    //     fps: 5
    // });
    // requestTimeout(function (delta) {
    //     document.querySelector('#fps5 span').innerHTML = Math.floor(1000 / (delta));
    //     circle5.loop();
    // }, 1000 / circle5.fps);

    // var canvas10 = document.querySelector('#fps10-canvas');
    // var circle10 = new Circle({
    //     x: 15,
    //     y: 20,
    //     vx: 1,
    //     vy: 0,
    //     ax: 1,
    //     ay: 0,
    //     radius: 15,
    //     ctx: canvas10.getContext('2d'),
    //     fps: 10
    // });
    // requestTimeout(function (delta) {
    //     document.querySelector('#fps10 span').innerHTML = Math.floor(1000 / (delta));
    //     circle10.loop();
    // }, 1000 / circle10.fps);

    // var canvas20 = document.querySelector('#fps20-canvas');
    // var circle20 = new Circle({
    //     x: 15,
    //     y: 20,
    //     vx: 1,
    //     vy: 0,
    //     ax: 1,
    //     ay: 0,
    //     radius: 15,
    //     ctx: canvas20.getContext('2d'),
    //     fps: 20
    // });
    // requestTimeout(function (delta) {
    //     document.querySelector('#fps20 span').innerHTML = Math.floor(1000 / (delta));
    //     circle20.loop();
    // }, 1000 / circle20.fps);

    // var canvas30 = document.querySelector('#fps30-canvas');
    // var circle30 = new Circle({
    //     x: 15,
    //     y: 20,
    //     vx: 1,
    //     vy: 0,
    //     ax: 1,
    //     ay: 0,
    //     radius: 15,
    //     ctx: canvas30.getContext('2d'),
    //     fps: 30
    // });
    // requestTimeout(function (delta) {
    //     document.querySelector('#fps30 span').innerHTML = Math.floor(1000 / (delta));
    //     circle30.loop();
    // }, 1000 / circle30.fps);

    // var canvas40 = document.querySelector('#fps40-canvas');
    // var circle40 = new Circle({
    //     x: 15,
    //     y: 20,
    //     vx: 1,
    //     vy: 0,
    //     ax: 1,
    //     ay: 0,
    //     radius: 15,
    //     ctx: canvas40.getContext('2d'),
    //     fps: 40
    // });
    // requestTimeout(function (delta) {
    //     document.querySelector('#fps40 span').innerHTML = Math.floor(1000 / (delta));
    //     circle40.loop();
    // }, 1000 / circle40.fps);

    // var canvas50 = document.querySelector('#fps50-canvas');
    // var circle50 = new Circle({
    //     x: 15,
    //     y: 20,
    //     vx: 1,
    //     vy: 0,
    //     ax: 1,
    //     ay: 0,
    //     radius: 15,
    //     ctx: canvas50.getContext('2d'),
    //     fps: 50
    // });
    // requestTimeout(function (delta) {
    //     document.querySelector('#fps50 span').innerHTML = Math.floor(1000 / (delta));
    //     circle50.loop();
    // }, 1000 / circle50.fps);

    // var canvas60 = document.querySelector('#fps60-canvas');
    // var circle60 = new Circle({
    //     x: 15,
    //     y: 20,
    //     vx: 1,
    //     vy: 0,
    //     ax: 1,
    //     ay: 0,
    //     radius: 15,
    //     ctx: canvas60.getContext('2d'),
    //     fps: 60
    // });
    // requestTimeout(function (delta) {
    //     document.querySelector('#fps60 span').innerHTML = Math.floor(1000 / (delta));
    //     circle60.loop();
    // }, 1000 / circle60.fps);



    /*function moveDivTimeBasedImprove(div, fps) {
        var left = 0;
        var current = +new Date;
        var previous = +new Date;
        var dt = 1000 / 60;
        var accumulateTime = 0;
        var param = 1;

        function loop() {
            var current = +new Date;
            var passed = current - previous;
            previous = current;
            accumulateTime += passed;
            while (accumulateTime >= dt) {
                update(dt);
                accumulateTime -= dt;
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
            circle.draw();
        }

        // setInterval(loop, 1000 / fps);
        requestTimeout(function (delta) {
            loop();
        }, 1000 / fps);
    }

    moveDivTimeBasedImprove(document.getElementById('div7'), 60);
    moveDivTimeBasedImprove(document.getElementById('div8'), 30);
    moveDivTimeBasedImprove(document.getElementById('div9'), 10);*/

    // Circle.prototype.step = function (dt) {
    //     // this.x += this.vx * dt * this.fps / 1000;
    //     // this.y += this.vy * dt * this.fps / 1000;

    //     this.vx += this.ax * dt;// * (this.fps / 1000);
    //     this.vy += this.ay * dt;// * (this.fps / 1000);

    //     // 60 fps 即每秒 60 帧，每帧移动一个单位距离，那么每秒移动 60 个单位距离，那么每毫秒移动 60/1000 个单位距离
    //     this.x += this.vx * dt;// * (this.fps / 1000);
    //     this.y += this.vy * dt;// * (this.fps / 1000);

    //     if (this.x - this.radius <= 0 || this.x + this.radius >= this.ctx.canvas.width) {
    //         this.vx = -this.vx;
    //     }
    //     if (this.y - this.radius <= 0 || this.y + this.radius >= this.ctx.canvas.height) {
    //         this.vy = -this.vy;
    //     }
    // };

    // var canvas = document.querySelector('#time-based-canvas');
    // var circle = new Circle({
    //     x: 15,
    //     y: 30,
    //     vx: 1,
    //     vy: 0,
    //     ax: 1,
    //     ay: 0,
    //     radius: 15,
    //     ctx: canvas.getContext('2d')
    // });
    // circle.step = function (dt) {
    //     // console.warn(dt);
    //     // this.vx += this.ax * dt * 0.12;// * (this.fps / 1000);
    //     // this.vy += this.ay * dt * 0.12;// * (this.fps / 1000);

    //     // 60 fps 即每秒 60 帧，每帧移动一个单位距离，那么每秒移动 60 个单位距离，那么每毫秒移动 60/1000 个单位距离
    //     this.x += this.vx * dt * 0.1;// * (this.fps / 1000);
    //     this.y += this.vy * dt * 0.1;// * (this.fps / 1000);

    //     if (this.x - this.radius <= 0 || this.x + this.radius >= this.ctx.canvas.width) {
    //         this.vx = -this.vx;
    //     }
    //     if (this.y - this.radius <= 0 || this.y + this.radius >= this.ctx.canvas.height) {
    //         this.vy = -this.vy;
    //     }
    // };

    // var timer = requestTimeout(function (delta) {
    //     // console.warn(delta, Math.floor(1000 / (delta)));
    //     circle.step(delta);
    //     circle.draw();
    //     document.querySelector('#time-based').innerHTML = 'time-based: fps: ' + Math.floor(1000 / (delta));
    // }, 16);

    // var canvas1 = document.querySelector('#time-based-canvas1');
    // var circle1 = new Circle({
    //     x: 15,
    //     y: 30,
    //     vx: 1,
    //     vy: 0,
    //     ax: 1,
    //     ay: 0,
    //     radius: 15,
    //     ctx: canvas1.getContext('2d')
    // });
    // circle1.step = function (dt) {
    //     // console.warn(dt);
    //     // this.vx += this.ax * dt * 0.12;// * (this.fps / 1000);
    //     // this.vy += this.ay * dt * 0.12;// * (this.fps / 1000);

    //     // 60 fps 即每秒 60 帧，每帧移动一个单位距离，那么每秒移动 60 个单位距离，那么每毫秒移动 60/1000 个单位距离
    //     this.x += this.vx * dt * 0.1;// * (this.fps / 1000);
    //     this.y += this.vy * dt * 0.1;// * (this.fps / 1000);

    //     if (this.x - this.radius <= 0 || this.x + this.radius >= this.ctx.canvas.width) {
    //         this.vx = -this.vx;
    //     }
    //     if (this.y - this.radius <= 0 || this.y + this.radius >= this.ctx.canvas.height) {
    //         this.vy = -this.vy;
    //     }
    // };

    // var timer1 = requestTimeout(function (delta) {
    //     // console.warn(delta, Math.floor(1000 / (delta)));
    //     circle1.step(delta);
    //     circle1.draw();
    //     document.querySelector('#time-based1').innerHTML = 'time-based1: fps: ' + Math.floor(1000 / (delta));
    // }, 60);


    // function move(fps) {
    //     var left = 0;
    //     var current = +new Date;
    //     var previous = +new Date;
    //     var dt = 1000 / fps;
    //     var accumulateTime = 0;
    //     var param = 1;

    //     function loop() {
    //         var current = +new Date;
    //         var passed = current - previous;
    //         previous = current;
    //         accumulateTime += passed; // 累积过去的时间
    //         while(accumulateTime >= dt) { // 当时间大于我们的固定的时间片的时候可以进行更新
    //             update(dt); // 分片更新时间
    //             accumulateTime -= dt;
    //         }
    //         draw();
    //     }

    //     function update(dt) {
    //         circle.step(dt);
    //         // console.warn('update');
    //     }

    //     function draw() {
    //         circle.draw();
    //         // console.log('draw');
    //     }

    //     // requestTimeout(loop, 1000 / fps);
    //     requestTimeout(loop);
    // }
    // move(60);

    // var canvas1 = document.querySelector('#time-based-canvas1');
    // var circle1 = new Circle({
    //     x: 15,
    //     y: 30,
    //     vx: 1,
    //     vy: 0,
    //     ax: 1,
    //     ay: 0,
    //     radius: 15,
    //     ctx: canvas1.getContext('2d')
    // });

    // circle1.step = function (dt) {
    //     // console.warn(dt);
    //     // this.vx += this.ax * dt * 0.12;// * (this.fps / 1000);
    //     // this.vy += this.ay * dt * 0.12;// * (this.fps / 1000);

    //     // 60 fps 即每秒 60 帧，每帧移动一个单位距离，那么每秒移动 60 个单位距离，那么每毫秒移动 60/1000 个单位距离
    //     this.x += this.vx * dt * 0.1;// * (this.fps / 1000);
    //     this.y += this.vy * dt * 0.1;// * (this.fps / 1000);

    //     if (this.x - this.radius <= 0 || this.x + this.radius >= this.ctx.canvas.width) {
    //         this.vx = -this.vx;
    //     }
    //     if (this.y - this.radius <= 0 || this.y + this.radius >= this.ctx.canvas.height) {
    //         this.vy = -this.vy;
    //     }
    // };

    // function move1(fps) {
    //     var left = 0;
    //     // var current = +new Date;
    //     var previous = +new Date;
    //     var dt = 1000 / fps;
    //     var accumulateTime = 0;
    //     var param = 1;

    //     function loop() {
    //         var current = +new Date;
    //         var passed = current - previous;
    //         previous = current;
    //         accumulateTime += passed; // 累积过去的时间
    //         while(accumulateTime >= dt) { // 当时间大于我们的固定的时间片的时候可以进行更新
    //             update(dt); // 分片更新时间
    //             accumulateTime -= dt;
    //         }
    //         draw();
    //     }

    //     function update(dt) {
    //         circle1.step(dt);
    //     }

    //     function draw() {
    //         circle1.draw();
    //     }

    //     // requestTimeout(loop, 1000 / fps);
    //     requestTimeout(loop);
    // }

    // move1(10);

}
