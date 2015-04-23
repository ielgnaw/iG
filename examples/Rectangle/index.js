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
                aX: 0.3,
                aY: 0.3,
                animInterval: 10000 // 切换 parallax 的间隔，这里指的是帧数间隔
            });

            game.start('stage-name');

            var isAdd = false;
            var scale = 0.01;
            var rect = new ig.Rectangle({
                // fillStyle: '#f00',
                name: 'rect1',
                x: 100,
                y: 80,
                width: 80,
                height: 80,
                debug: 1,
                vX: 1,
                vY: 1,
                zIndex: 2,
                // scaleX: 1.5,
                angle: 60,
                captureFunc: function (d) {
                    console.warn(d);
                    console.warn(this);
                },
                moveFunc: function (d) {
                    // this.x = d.x;
                    // this.y = d.y;
                    this.move(d.x, d.y);
                },
                releaseFunc: function () {
                }
            });
            rect.update = function () {
                this.angle = this.angle + 10.5;
                // this.moveStep();
                // console.warn(this.bounds.x, this.x, this.vX);
                // console.warn(this.bounds.x + this.bounds.width, game.width);
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

                if (this.collidesWith(rect1)) {
                    this.fillStyle = 'yellow';
                }
                else {
                    this.fillStyle = '#000';
                }
                // if (this.collidesWith(rect1).overlap) {
                //     // console.warn(this.collidesWith(rect1));
                //     console.warn(this.collidesWith(rect1));
                //     var mtv = this.collidesWith(rect1);
                //     var dy = mtv.axis.y * mtv.overlap;
                //     var dx = mtv.axis.x * mtv.overlap;

                //     if ((dx < 0 && this.bounds.x < 0) || (dx > 0 && this.bounds.x > 0)) {
                //         dx = -dx;

                //         // dx = -dx;
                //         // this.vX = this.vX * dx / this.width;
                //         this.vX = dx;
                //     }

                //     if ((dy < 0 && this.bounds.y < 0) || (dy > 0 && this.bounds.y > 0)) {
                //         dy = -dy;

                //         // dy = -dy;
                //         // this.vY = this.vY * dy / this.height;
                //         this.vY = dy;
                //     }

                //     // 减速
                //     if (Math.abs(this.vX) >= 15) {
                //         this.frictionX = .5;
                //     }
                //     else {
                //         this.frictionX = 1;
                //     }
                //     if (Math.abs(this.vY) >= 15) {
                //         this.frictionY = .5;
                //     }
                //     else {
                //         this.frictionY = 1;
                //     }

                //     this.moveStep();

                //     // this.x += dx;
                //     // this.y += dy;

                //     // this.generatePoints();
                //     // this.getBounds();
                // }
            }
            stage.addDisplayObject(rect);

            var rect1 = new ig.Rectangle({
                fillStyle: '#f00',
                name: 'rect2',
                x: 200,
                y: 180,
                width: 80,
                height: 30,
                debug: 1,
                vX: 1,
                vY: 1,
                zIndex: 2,
                // scaleX: 1.5,
                angle: 45,
                captureFunc: function (d) {
                },
                moveFunc: function (d) {
                    this.x = d.x;
                    this.y = d.y;
                },
                releaseFunc: function () {
                }
            });
            rect1.update = function () {
                this.angle = this.angle + 0.5;
                this.moveStep();
                // console.warn(this.bounds.x, this.x, this.vX);
                // console.warn(this.bounds.x + this.bounds.width, game.width);
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

                if (isAdd) {
                    scale = scale + 0.01;
                }
                else {
                    scale = scale - 0.01;
                }

                if (scale >= 1) {
                    isAdd = false;
                }

                if (scale <= 0.01) {
                    isAdd = true;
                }
                this.scaleX = scale;
                this.scaleY = scale;

                // console.warn(this.collidesWith(rect));
                if (this.collidesWith(rect)) {
                    this.fillStyle = 'green';
                }
                else {
                    this.fillStyle = '#f00';
                }
            }
            stage.addDisplayObject(rect1);

             var polygon = new ig.Polygon({
                fillStyle: '#000',
                name: 'polygon',
                x: 100,
                y: 80,
                points: [
                    {
                        x: 30,
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
                        x: 50,
                        y: 240
                    },
                    {
                        x: 30,
                        y: 180
                    }
                ],
                debug: 1,
                // vX: 3,
                // vY: 3,
                zIndex: 2,
                // scaleX: 1.5,
                // angle: 80,
                captureFunc: function (d) {
                    console.warn(d);
                    console.warn(this);
                },
                moveFunc: function (d) {
                    this.move(d.x, d.y);
                },
                releaseFunc: function () {
                }
            });
            polygon.update = function () {
                this.angle = this.angle + 1.5;
                // this.moveStep();
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

                // if (scale <= 0.1) {
                //     isAdd = true;
                // }
                // this.scaleX = scale;
                // this.scaleY = scale;

                if (this.collidesWith(rect)) {
                    this.fillStyle = 'yellow';
                }
                else {
                    this.fillStyle = '#000';
                }
            }
            stage.addDisplayObject(polygon);
        }
    );
};
