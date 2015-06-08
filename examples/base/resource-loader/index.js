
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
        document.querySelector('#fps').innerHTML
            = (e.data.loadedCount / e.data.total).toFixed(1) * 100 + '%'
    }).on('loadResDone', function (e) {
        // console.warn(e, 'loadResDone');
        // simulateEvent();
        // this.asset.a2o.play();
    });

    // function simulateEvent() {
    //     var e = document.createEvent('HTMLEvents');
    //     e.initEvent('click',true, true);
    //     document.dispatchEvent(e);
    // }

    // document.onclick = function () {
    //     alert(3)
    // }

    game1.start('asdda', function () {
        console.warn('startCallback');
    });

    // setTimeout(function () {
    //     console.warn('aaa');
    //     game1.start();
    // }, 10000)


    // game1.loadImage('a', '/examples/img/basse/bg.jpg', function (e) {
    //     console.log(arguments)
    // }, function (e) {
    //     console.log('errorCallback', e)
    // });

    // game1.loadImage('/examples/img/bg4.jpg', function (d) {console.log('callback', d)}, function (d) {console.log('errorCallback', d)});
    // game1.loadImage('/examples/img/bg4.jpg', function (d) {console.log('callback', d)}, function (d) {console.log('errorCallback', d)});
    // game1.loadImage('/examples/img/base/bgd.jpg', function (d) {console.log('callback', d)});
    // game1.loadImage('/examples/img/base/bg.jpg');

    // game1.loadOther('ccc', './data/test.json', function () {
    //     console.warn(arguments);
    //     console.warn(game1);
    // }, function () {
    //     console.warn(arguments, 111);
    // });
};
