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
                        x: 120,
                        y: 150
                    },
                    {
                        x: 280,
                        y: 210
                    },
                    {
                        x: 180,
                        y: 260
                    },
                    {
                        x: 120,
                        y: 240
                    },
                    {
                        x: 80,
                        y: 180
                    },
                ],
                debug: 1,
                angle: 0,
                vX: 1,
                captureFunc: function (d) {
                    console.warn(d);
                    console.warn(this);
                    // this.x = 100;
                    // this.y = 100;
                    // debugger
                    // this.move(d.x - this.originalPoints[0].x, d.y - this.originalPoints[0].y);
                    // this.setPosY(100);
                },
                moveFunc: function (d) {
                    this.move(d.x - this.originalPoints[0].x, d.y - this.originalPoints[0].y);
                    console.warn(this.x);
                }
                // releaseFunc
            });
            var isAdd = false;
            var scale = 0.01;
            polygon.update = function () {
                // console.warn(this.bounds);
                // if (this.bounds.x + this.bounds.width > game.width) {
                //     this.move(-1, 0);
                // }
                // else {
                //     this.move(1,0);
                // }
                // console.warn(game.width);
                this.angle = this.angle + 0.5;
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
                // this.scaleX = scale;
                // this.scaleY = scale;
            }

            stage.addDisplayObject(polygon);

            // var polygon2 = new ig.Polygon({
            //     name: 'polygon2',
            //     points: [
            //         {
            //             x: 90,
            //             y: 150
            //         },
            //         {
            //             x: 150,
            //             y: 210
            //         },
            //         {
            //             x: 100,
            //             y: 180
            //         },
            //     ],
            //     // debug: 1,
            //     angle: 0,
            //     captureFunc: function () {
            //         console.warn(1);
            //     }
            // });
            // stage.addDisplayObject(polygon2);
            // console.warn(polygon2);

            // game.on('afterGameRender', function (d) {
            //     // console.warn(stage);
            // })

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
