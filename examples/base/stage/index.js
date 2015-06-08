
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
        // bgColor: '#f00',
        // bgImg: '/examples/img/base/boom.png',
        // bgImg: '/examples/img/base/bg1.png',
        bgImg: 'bg1',
        bgImgRepeatPattern: 'full',
        parallaxList: [
            {
                image: 'bg1',
                ax: 1,
                repeat: 'repeat-x',
            }
        ],
        captureFunc: function (e) {
            console.warn(e);
        }
    });

    // stage1.setBgImg(game1.asset.bg);

    game1.start('asdda', function () {
        console.warn('startCallback');
        console.warn(stage1);
        console.warn(game1);
    }).on('gameFPS', function (e) {
        // console.warn(e.data.fps);
        document.querySelector('#fps').innerHTML = 'fps: ' + e.data.fps;
    });

};
