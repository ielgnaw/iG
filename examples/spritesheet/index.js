
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
            {
                id: 'bg',
                src: '../img/bg.jpg'
            },
            {
                id: 'playBut',
                src: '../img/playBut.png'
            },
            {
                id: 'test2',
                src: '../img/test2.png'
            },
            {
                id: 'test1',
                src: '../img/test1.png'
            },
            {
                id: 'ss3',
                src: '../img/sprite-sheet3.png'
            },
            {
                id: 'spritesData',
                src: './data/sprite-sheet3.json'
            },
            {
                id: 'ss2',
                src: '../img/sprite-sheet2.jpg'
            },
            {
                id: 'spritesData1',
                src: './data/sprite-sheet2.json'
            }
        ],
        function (d) {
            var stage = game.createStage({
                name: 'bg'
            }).setParallax({
                image: d.bg,
                anims: [
                    {
                        aX: 1,
                        aY: 1
                    },
                    {
                        aX: -1,
                        aY: 1
                    }
                ],
                animInterval: 1000 // 切换 parallax 的间隔，这里指的是帧数间隔
            });

            var spritesData = d.spritesData;
            var isAdd = false;
            var scale = 0.01;
            // 红色气球
            var redData = spritesData.red;
            var red = new ig.SpriteSheet({
                fillStyle: 'green',
                name: 'red',
                image: d.ss3,
                x: stage.width / 2,
                y: stage.height / 2,
                sX: redData.sX,
                sY: redData.sY,
                total: redData.total,
                tileW: redData.tileW,
                tileH: redData.tileH,
                cols: redData.cols,
                rows: redData.rows,
                zIndex: 1,
                ticksPerFrame: 3,
                // debug: 1,
                vX: 1,
                vY: 1,
                captureFunc: function (d) {
                    console.warn(d);
                    console.warn(this);
                },
                moveFunc: function (d) {
                    this.move(d.x, d.y);
                },
            });

            red.update = function () {
                this.angle = this.angle + 0.5;
                // debugger
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

                if (this.collidesWith(smallBoom)) {
                    this.fillStyle = 'yellow';
                }
                else {
                    this.fillStyle = 'green';
                }
            }
            stage.addDisplayObject(red);

            setTimeout(function () {
                red.destroy();
                console.warn(game);
            }, 3000);

            // var orangeData = spritesData.orange;
            // var orange = new ig.SpriteSheet({
            //     name: 1,
            //     image: d.ss3,
            //     x: 100,
            //     y: 100,
            //     sX: orangeData.sX,
            //     sY: orangeData.sY,
            //     total: orangeData.total,
            //     tileW: orangeData.tileW,
            //     tileH: orangeData.tileH,
            //     cols: orangeData.cols,
            //     rows: orangeData.rows,
            //     zIndex: 1,
            //     ticksPerFrame:1
            // });
            // stage.addDisplayObject(orange);

            var smallBoomData = spritesData.smallBoom;
            var smallBoom = new ig.SpriteSheet({
                name: 2,
                image: d.ss3,
                x: 210,
                y: 210,
                sX: smallBoomData.sX,
                sY: smallBoomData.sY,
                total: smallBoomData.total,
                tileW: smallBoomData.tileW,
                tileH: smallBoomData.tileH,
                cols: smallBoomData.cols,
                rows: smallBoomData.rows,
                zIndex: 1,
                ticksPerFrame: 10,
                debug: 1,
                // vX: 1,
                // vY: 1,
                fillStyle: '#fff',
                captureFunc: function (d) {
                    console.warn(d);
                    console.warn(this);
                },
                moveFunc: function (d) {
                    this.move(d.x, d.y);
                },
            });

            smallBoom.update = function () {
                // this.angle = this.angle + 1.5;
                // debugger
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

                if (isAdd) {
                    scale = scale + 0.01;
                }
                else {
                    scale = scale - 0.01;
                }

                // if (scale >= 1) {
                //     isAdd = false;
                // }

                // if (scale <= 0.01) {
                //     isAdd = true;
                // }
                // this.scaleX = scale;
                // this.scaleY = scale;

                if (this.collidesWith(red)) {
                    this.fillStyle = 'blue';
                }
                else {
                    this.fillStyle = '#fff';
                }
            }
            stage.addDisplayObject(smallBoom);

            // var redCapture = spritesData.redCapture;
            // var redCapture = new ig.SpriteSheet({
            //     name: 3,
            //     image: d.ss3,
            //     x: 150,
            //     y: 300,
            //     sX: redCapture.sX,
            //     sY: redCapture.sY,
            //     total: redCapture.total,
            //     tileW: redCapture.tileW,
            //     tileH: redCapture.tileH,
            //     cols: redCapture.cols,
            //     rows: redCapture.rows,
            //     zIndex: 1,
            //     ticksPerFrame: 10
            // });
            // stage.addDisplayObject(redCapture);

            // var spritesData1 = d.spritesData1;
            // var boom1 = spritesData1.boom1;
            // var boom1 = new ig.SpriteSheet({
            //     name: 4,
            //     image: d.ss2,
            //     x: 150,
            //     y: 500,
            //     sX: boom1.sX,
            //     sY: boom1.sY,
            //     total: boom1.total,
            //     tileW: boom1.tileW,
            //     tileH: boom1.tileH,
            //     cols: boom1.cols,
            //     rows: boom1.rows,
            //     zIndex: 1,
            //     ticksPerFrame: 10
            // });
            // stage.addDisplayObject(boom1);

            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            });
        }
    );
};
