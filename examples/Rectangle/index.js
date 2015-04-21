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

            var subX = 0;
            var subY = 0;
            var rect = new ig.Rectangle({
                // fillStyle: '#f00',
                name: 'rect1',
                x: 100,
                y: 80,
                width: 100,
                height: 50,
                // debug: 1,
                vX: 3,
                vY: 3,
                zIndex: 2,
                captureFunc: function (d) {
                    console.warn(d);
                    console.warn(this);
                    // subX = d.x - this.x;
                    // subY = d.y - this.y;
                },
                moveFunc: function (d) {
                    this.x = d.x;// - subX;
                    this.y = d.y;// - subY;
                },
                releaseFunc: function () {
                    // subX = 0;
                    // subY = 0;
                }
            });

            rect.update = function () {
                // this.angle = this.angle + 0.5;
                // this.moveStep();
                // console.warn(this.bounds.x, this.bounds.width);
                // console.warn(this.bounds.x + this.bounds.width, game.width);
                if (this.bounds.x + this.bounds.width > game.width
                    || this.bounds.x < 0
                ) {
                    // debugger
                    this.vX = -this.vX;
                }

                if (this.bounds.y + this.bounds.height > game.height
                    || this.bounds.y < 0
                ) {
                    this.vY = -this.vY;
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
            }

            stage.addDisplayObject(rect);

        }
    );
};
