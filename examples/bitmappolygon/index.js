'use strict';

/* global ig */

window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var fpsNode = document.querySelector('#fps');

    var game = new ig.Game(
        {
            canvas: canvas,
            name: 'bitmappolygon-test-game',
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
            },
            {
                id: 'playBut',
                src: '../img/playBut.png'
            }
        ],
        function (d) {
            var stage = game.createStage({
                name: 'stage-name'
            }).setParallax({
                image: d.bg,
                aX: 0.3,
                aY: 0.3,
                animInterval: 10000 // 切换 parallax 的间隔，这里指的是帧数间隔
            });

            game.start('stage-name');

            var isAdd = false;
            var scale = 0.01;

            var bitmap = new ig.BitmapPolygon({
                fillStyle: '#f00',
                name: 'bitmap',
                x: 50,
                y: 50,
                // sX: 10,
                // sY: 10,
                vX: 1.5,
                vY: 1.5,
                points: [
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: 80,
                        y: 0
                    },
                    {
                        x: 80,
                        y: 80
                    },
                    {
                        x: 0,
                        y: 80
                    }
                ],
                sWidth: 110,
                sHeight: 110,
                image: d.playBut,
                debug: true,
                mouseEnable: true,
                // angle: 30,
                captureFunc: function (d) {
                    console.warn(d);
                    console.warn(this);
                },
                moveFunc: function (d) {
                    this.move(d.x, d.y);
                },
            });

            bitmap.update = function () {
                this.angle = this.angle + 0.5;
                this.moveStep();

                if (this.bounds.x + this.bounds.width > game.width) {
                    this.vX = -Math.abs(this.vX);
                }
                else if (this.bounds.x < 0) {
                    this.vX = Math.abs(this.vX);
                }

                if (this.bounds.y + this.bounds.height > game.height) {
                    this.vY = -Math.abs(this.vY);
                }
                else if (this.bounds.y < 0) {
                    this.vY = Math.abs(this.vY);
                }

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

                if (this.collidesWith(bitmap1)) {
                    this.fillStyle = '#f00';
                }
                else {
                    this.fillStyle = 'transparent';
                }
            }

            stage.addDisplayObject(bitmap);

            var bitmap1 = new ig.BitmapPolygon({
                name: 'bitmap1',
                x: 50,
                y: 50,
                // sX: 10,
                // sY: 10,
                vX: 3,
                vY: 3,
                points: [
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: 80,
                        y: 0
                    },
                    {
                        x: 80,
                        y: 80
                    },
                    {
                        x: 0,
                        y: 80
                    }
                ],
                sWidth: 110,
                sHeight: 110,
                image: d.playBut,
                debug: true,
                mouseEnable: true,
                // angle: 30,
                captureFunc: function (d) {
                    console.warn(d);
                    console.warn(this);
                },
                moveFunc: function (d) {
                    this.move(d.x, d.y);
                },
            });

            bitmap1.update = function () {
                this.angle = this.angle + 0.5;
                this.moveStep();

                if (this.bounds.x + this.bounds.width > game.width) {
                    this.vX = -Math.abs(this.vX);
                }
                else if (this.bounds.x < 0) {
                    this.vX = Math.abs(this.vX);
                }

                if (this.bounds.y + this.bounds.height > game.height) {
                    this.vY = -Math.abs(this.vY);
                }
                else if (this.bounds.y < 0) {
                    this.vY = Math.abs(this.vY);
                }

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

                if (this.collidesWith(bitmap)) {
                    this.fillStyle = 'yellow';
                }
                else {
                    this.fillStyle = 'transparent';
                }
            }

            stage.addDisplayObject(bitmap1);

        }
    );
};
