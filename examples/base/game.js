
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
            '/examples/img/base/boom.png'
        ]
    }).on('loadResProcess', function (e) {
        document.querySelector('#fps').innerHTML
            = (e.data.loadedCount / e.data.total).toFixed(1) * 100 + '%'
    }).on('loadResDone', function (e) {
        // console.warn(e, 'loadResDone');
        console.warn(this, 's');
    });


    game1.start();


    // for (var i = 0; i < 10; i++) {
    //     (function (index) {
    //         setTimeout(function () {
    //             console.warn(index);
    //         }, index * 300)
    //     })(i)
    // }


    // setInterval(function () {
    //     ig.util.debounce(function () {
    //         console.warn(1);
    //     }, 1000)();
    //     ig.util.throttle(function () {
    //         console.warn(2);
    //     }, 200)();
    // }, 30);




    // console.warn(ig);
    // var fpsNode = document.querySelector('#fps');

    // var game = new ig.Game(
    //     {
    //         canvas: canvas,
    //         name: 'fps-test-game',
    //         fps: 50,
    //         maximize: 1,
    //         // horizontalPageScroll: 100
    //     }
    // ).on('beforeGameRender', function (d) {
    //     // console.warn('beforeGameRender', d);
    // }).on('afterGameRender', function (d) {
    //     // console.warn('afterGameRender', d);
    // }).on('gameFPS', function (d) {
    //     fpsNode.innerHTML = 'fps: ' + d.data.fps;
    // })/*.start(function () {
    //     console.warn('start callback');
    // })*/;

    /*document.querySelector('.control').onclick = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var target = e.target || e.srcElement;

        if (target.tagName.toLowerCase() === 'a') {
            var type = target.getAttribute('data');

            switch (type) {
                case 'start':
                    game.start(function () {
                        game.loadResource(
                            [
                                '/examples/img/1.jpg',
                                {
                                    id: 'bg',
                                    src: '/examples/img/bg.jpg'
                                },
                                {
                                    id: 'jsonData',
                                    src: '/examples/resource-loader/data/test.json'
                                },
                                {
                                    id: 'textData',
                                    src: '/examples/resource-loader/data/text.text'
                                }
                            ],
                            function (d) {
                                console.log('all done', d);
                            },
                            {
                                processCallback: function (d) {
                                    console.warn('process', d);
                                }
                            }
                        );
                    });
                    break;
                case 'stop':
                    game.stop();
                    break;
                case 'pause':
                    game.pause();
                    break;
                case 'resume':
                    game.resume();
                    break;
                default:
            }
        }
    };*/

};
