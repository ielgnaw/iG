
'use strict';

/* global ig */

window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');

    var game1 = new ig.Game({
        canvas: canvas,
        name: 'test-game1',
        maximize: 1,
        resource: [
            {id: 'bg', src: '/examples/img/base/bg.jpg'},
            {id: 'bg1', src: '/examples/img/base/bg1.png'},
            {id: 'bg2', src: '/examples/img/base/bg2.png'},
            {id: 'bg3', src: '/examples/img/base/bg3.png'},
            {id: 'test2', src: '/examples/img/base/2.png'},
            {id: 'testData', src: './data/test.json'},
            {id: 'text', src: './data/text.text'},
            {id: 'a2o', src: ['./data/a2.mp3','./data/a2.ogg'], opts: {loop: true}},
            '/examples/img/base/boom.png'
        ]
    }).on('loadResProcess', function (e) {
        document.querySelector('#load-process').innerHTML
            = 'loadProcess: ' + (e.data.loadedCount / e.data.total).toFixed(1) * 100 + '%'
    }).on('loadResDone', function (e) {
    });

    var stage1 = game1.createStage({
        name: 'stage-name1',
        // parallaxOpts: [
        //     {
        //         image: 'bg',
        //         anims: [
        //             {
        //                 ax: 1,
        //                 ay: 1
        //             },
        //             {
        //                 ax: -1,
        //                 ay: 1
        //             }
        //         ],
        //         animInterval: 100
        //     }
        // ],
        captureFunc: function (e) {
            console.warn(e);
        }
    });

    // var text1 = stage1.createDisplayObject({
    var text1 = new ig.Text({
        name: 'text1',
        content: 'oh no....',
        x: 200,
        y: 200,
        // scaleX: 0.5,
        // scaleY: 0.5,
        size: 20,
        isBold: true,
        angle: 0,
        debug: 1,
        zIndex: 100,
        fillStyle: '#f00',
        // useCache: false
    });
    stage1.addDisplayObject(text1);

    text1.step = function (dt, stepCount) {
        this.angle++;

        // this.setScale(this.scaleX + 0.01, this.scaleY + 0.01);
        // this.scaleX += 0.01;
        // this.scaleY += 0.01;
        // console.warn(dt);
    };

    var text12 = new ig.Text({
        name: 'text12',
        content: '卧槽。。。',
        x: 200,
        y: 400,
        // scaleX: 0.5,
        // scaleY: 0.5,
        size: 20,
        isBold: true,
        angle: 0,
        debug: 1,
        zIndex: 100,
        fillStyle: '#f0f'
    });
    stage1.addDisplayObject(text12);

    game1.start('asdda', function () {
        console.warn('startCallback');
        console.warn(stage1);
    }).on('gameFPS', function (e) {
        // console.warn(e.data.fps);
        document.querySelector('#fps').innerHTML = 'fps: ' + e.data.fps;
    });

};
