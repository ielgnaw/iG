
'use strict';

/* global ig */

window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var fpsNode = document.querySelector('#fps');

    var game = new ig.Game(
        {
            canvas: canvas,
            name: 'fps-test-game',
            fps: 50,
            maximize: 1,
            // horizontalPageScroll: 100
        }
    ).on('beforeGameRender', function (d) {
        // console.warn('beforeGameRender', d);
    }).on('afterGameRender', function (d) {
        // console.warn('afterGameRender', d);
    }).on('gameFPS', function (d) {
        fpsNode.innerHTML = 'fps: ' + d.data.fps;
    })/*.start(function () {
        console.warn('start callback');
    })*/;

    document.querySelector('.control').onclick = function (e) {
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
    };

};
