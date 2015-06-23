
'use strict';

/* global ig */

window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');

    var game1 = new ig.Game({
        canvas: canvas,
        name: 'test-game1',
        maximize: 1,
    }).on('loadResProcess', function (e) {
        document.querySelector('#load-process').innerHTML
            = 'loadProcess: ' + (e.data.loadedCount / e.data.total).toFixed(1) * 100 + '%'
    }).on('loadResDone', function (e) {
    });

    var stage1 = game1.createStage({
        name: 'stage-name1',
        captureFunc: function (e) {
            console.warn(e);
            console.warn(polygon1.hitTestPoint(e.x, e.y));
            // console.warn(text1.hitTestPoint(e.x, e.y));
        }
    });

    var polygon1 = stage1.addDisplayObject(
        new ig.Polygon({
            name: 'polygon1',
            // sWidth: 110,
            // sHeight: 110,
            debug: 1,
            x: 150,
            y: 150,
            angle: 30,
            fillStyle: 'blue',
            // width: 80,
            // height: 80,
            points: [
                {
                    x: 0,
                    y: 0
                },
                {
                    x: 128,
                    y: 0
                },
                {
                    x: 128,
                    y: 64
                },
                {
                    x: 0,
                    y: 64
                },
                {
                    x: -32,
                    y: 64
                }
            ],
            vx: 1,
            mouseEnable: true,
            moveFunc: function (d) {
                d.domEvent.preventDefault();
                // console.warn(d);
                this.move(d.x, d.y);
            },
        })
    );

    polygon1.step = function (dt, stepCount, requestID) {
        // console.warn(arguments);
        // this.angle += 1;
        // this.vx += this.ax * dt;
        // this.vx *= this.frictionX * dt;
        // this.vy += this.ay * dt;
        // this.vy *= this.frictionY * dt;

        // this.x += this.vx * dt;
        // this.y += this.vy * dt;

        // if (this.bounds.x + this.bounds.width > game1.width) {
        //     this.vx = -Math.abs(this.vx);
        // }
        // else if (this.bounds.x < 0) {
        //     this.vx = Math.abs(this.vx);
        // }

        // if (this.bounds.y + this.bounds.height > game1.height) {
        //     this.vy = -Math.abs(this.vy);
        // }
        // else if (this.bounds.y < 0) {
        //     this.vy = Math.abs(this.vy);
        // }
        // this.move(this.x, this.y);
    };

    var rectangle1 = stage1.addDisplayObject(
        new ig.Rectangle({
            name: 'rectangle',
            fillStyle: 'blue',
            // sWidth: 110,
            // sHeight: 110,
            debug: 1,
            x: 200,
            y: 300,
            width: 40,
            height: 80,
            vx: 1,
            mouseEnable: true,
            moveFunc: function (d) {
                d.domEvent.preventDefault();
                // console.warn(d);
                this.move(d.x, d.y);
            },
        })
    );

    rectangle1.step = function (dt, stepCount, requestID) {
        // this.angle += 1;
        // this.vx += this.ax * dt;
        // this.vx *= this.frictionX * dt;
        // this.vy += this.ay * dt;
        // this.vy *= this.frictionY * dt;

        // this.x += this.vx * dt;
        // this.y += this.vy * dt;

        // if (this.bounds.x + this.bounds.width > game1.width) {
        //     this.vx = -Math.abs(this.vx);
        // }
        // else if (this.bounds.x < 0) {
        //     this.vx = Math.abs(this.vx);
        // }

        // if (this.bounds.y + this.bounds.height > game1.height) {
        //     this.vy = -Math.abs(this.vy);
        // }
        // else if (this.bounds.y < 0) {
        //     this.vy = Math.abs(this.vy);
        // }
        // this.move(this.x, this.y);
        // console.warn(this);
        // console.warn(this.collidesWith(polygon1));
    };

    var rectangle2 = stage1.addDisplayObject(
        new ig.Rectangle({
            name: 'rectangle2',
            fillStyle: 'blue',
            // sWidth: 110,
            // sHeight: 110,
            debug: 1,
            x: 300,
            y: 200,
            width: 40,
            height: 80,
            vx: 1,
            angle: 30,
            mouseEnable: true,
            moveFunc: function (d) {
                d.domEvent.preventDefault();
                // console.warn(d);
                this.move(d.x, d.y);
            },
        })
    );

    game1.start('asdda', function () {
        console.warn('startCallback');
        console.warn(stage1);
    }).on('gameFPS', function (e) {
        // console.warn(e.data.fps);
        document.querySelector('#fps').innerHTML = 'fps: ' + e.data.fps;
    });

};
