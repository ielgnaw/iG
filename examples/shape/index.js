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
                animInterval: 1000 // 切换 parallax 的间隔，这里指的是帧数间隔
            });

            game.start('stage-name');

            var polygon = new ig.Polygon({
                name: 'polygon1',
                points: [
                    {
                        x: 0,
                        y: 80
                    },
                    {
                        x: 120,
                        y: 160
                    },
                    {
                        x: 100,
                        y: 200
                    },
                    {
                        x: 30,
                        y: 180
                    }
                ],
                debug: 1,
                angle: 0,
                vX: 1,
                // vY: 5,
                zIndex: 10,
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
                    console.warn(this.bounds);
                    this.move(d.x - this.originalPoints[0].x, d.y - this.originalPoints[0].y);
                    console.warn(this.x);
                }
                // releaseFunc
            });
            var isAdd = false;
            var scale = 0.01;

            // polygon.setAnimate({
            //     target: {
            //         // y: 10,
            //         // scaleX: 0.5,
            //         angle: 180
            //     },
            //     // repeat: 1,
            //     // tween: ig.easing.easeInBounce,
            //     duration: 5000,
            //     stepFunc: function () {
            //         // console.warn('step');
            //     },
            //     repeatFunc: function () {
            //         // console.warn('repeat');
            //     },
            //     groupCompleteFunc: function () {
            //         // console.warn('groupCompleteFunc');
            //     },
            //     completeFunc: function () {
            //         // console.warn('completeFunc');
            //     }
            // });
            polygon.update = function () {
                // this.angle = this.angle + 0.5;
                this.moveStep();
                // // console.warn(this.x);
                // console.warn(this.bounds.x + this.bounds.width, game.width);
                // debugger
                if (this.bounds.x + this.bounds.width > game.width
                    || this.bounds.x < 0
                ) {
                    this.vX = -this.vX;
                }

                if (this.bounds.y + this.bounds.height > game.height
                    || this.bounds.y < 0
                ) {
                    this.vY = -this.vY;
                }
                // else {
                //     this.move(1, 0);
                // }
                // if (this.bounds.x <= 0) {
                //     this.move(1, 0);
                // }
                // else {
                //     this.move(1,0);
                // }
                // console.warn(game.width);
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
            //     fillStyle: '#f00',
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
            //     debug: 1,
            //     angle: 0,
            //     captureFunc: function () {
            //         console.warn(1);
            //     }
            // });
            // polygon2.update = function () {
            //     this.angle = this.angle + 0.5;
            // }
            // stage.addDisplayObject(polygon2);
        }
    );
};
