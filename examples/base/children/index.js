
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

    var text1 = new ig.Text({
        name: 'text1',
        content: 'oh no....',
        x: 20,
        y: 20,
        // scaleX: 0.5,
        // scaleY: 0.5,
        size: 20,
        isBold: true,
        angle: 0,
        debug: 1,
        zIndex: 100,
        fillStyle: '#fff',
        mouseEnable: true,
        moveFunc: function (d) {
            // console.warn(d);
            this.move(d.x, d.y);
        },
        // useCache: false
    });

    var polygon1 = stage1.addDisplayObject(
        new ig.Polygon({
            name: 'polygon1',
            // sWidth: 110,
            // sHeight: 110,
            debug: 1,
            x: 150,
            y: 150,
            fillStyle: 'rgba(0, 0, 0, 0.6)',
            // width: 80,
            // height: 80,
            children: [text1],
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
            vy: 1,
            mouseEnable: true,
            moveFunc: function (d) {
                d.domEvent.preventDefault();
                // console.warn(d);
                this.move(d.x, d.y);
            },
        })
    );

    polygon1.step = function (dt, stepCount, requestID) {
        this.angle += 1;
        // this.children[0].angle += 1;
        // this.alpha -= 0.01;
        // this.setScale(this.scaleX + 0.01, this.scaleY + 0.01);
        // this.scaleX += 0.01;
        // this.scaleY += 0.01;
        // console.warn(dt);

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

    console.warn(polygon1);

    // var text1 = stage1.addDisplayObject(
    //     new ig.Text({
    //         name: 'text1',
    //         content: 'oh no....',
    //         x: 200,
    //         y: 400,
    //         // scaleX: 0.5,
    //         // scaleY: 0.5,
    //         size: 20,
    //         isBold: true,
    //         angle: 0,
    //         debug: 1,
    //         zIndex: 100,
    //         fillStyle: '#f00',
    //         mouseEnable: true,
    //         moveFunc: function (d) {
    //             // console.warn(d);
    //             this.move(d.x, d.y);
    //         },
    //         // useCache: false
    //     })
    // );

    // text1.step = function (dt, stepCount) {
    //     this.angle += 1;
    // };

    game1.start('asdda', function () {
        console.warn('startCallback');
        console.warn(stage1);
    }).on('gameFPS', function (e) {
        // console.warn(e.data.fps);
        document.querySelector('#fps').innerHTML = 'fps: ' + e.data.fps;
    });

};
