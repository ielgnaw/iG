'use strict';

/* global ig */

window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var fpsNode = document.querySelector('#fps');

    var game = new ig.Game(
        {
            canvas: canvas,
            name: 'shape-test-game',
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

    game.loadResource(
        [
            '/examples/img/1.jpg',
            {
                id: 'bg',
                src: '/examples/img/bg.jpg'
            },
            {
                id: 'bg1',
                src: '/examples/img/1.jpg'
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
            var stage = game.createStage({
                name: 'stage-name'
            }).setParallax({
                image: d.bg,
                aX: 1,
                aY: 1,
                // repeat: 'repeat',
                // , anims: [
                //     {
                //         aX: 1
                //         , aY: 1
                //     },
                //     {
                //         aX: -1
                //         , aY: 1
                //     }
                // ]
                animInterval: 1000 // 切换 parallax 的间隔，这里指的是帧数间隔
            });

            game.start('stage-name');

            var polygon = new ig.Polygon({
                name: 'polygon1',
                points: [
                    {
                        x: 290,
                        y: 150
                    },
                    {
                        x: 280,
                        y: 210
                    },
                    {
                        x: 180,
                        y: 200
                    },
                ],
                debug: 1,
                angle: 0
            });

            var isAdd = false;
            var scale = 0.01;
            polygon.update = function () {
                this.p.angle++;
                // if (isAdd) {
                //     scale = scale + 0.01;
                // }
                // else {
                //     scale = scale - 0.01;
                // }

                // if (scale >= 1) {
                //     isAdd = false;
                // }

                // if (scale <= 0.01) {
                //     isAdd = true;
                // }
                // this.p.scaleX = scale;
                // this.p.scaleY = scale;
            }

            stage.addDisplayObject(polygon);
            console.warn(polygon);

            // stage.setBgImg(d.bg);

            // setTimeout(function () {
            //     stage.setBgImg(d.bg1, 'center');
            //     setTimeout(function () {
            //         stage.setBgImg('', 'center');
            //     }, 3000);
            // }, 3000);

            // console.warn(game);

            // console.warn(stage);
        }
    );

    // stage.setBgColor('#f00');
};
