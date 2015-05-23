
'use strict';

/* global ig */


window.onload = function () {
    var canvas = document.querySelector('#canvas');

    var game = new ig.Game(
        {
            canvas: canvas,
            name: 'xiongchumo-test-game',
            fps: 50,
            maximize: 1,
            maxWidth: 320,
            maxHeight: 416
        }
    );

    game.loadResource(
        [
            {id: 'bgImg', src: '../img/xiongchumo/bg.jpg'},
            {id: 'spritesImg', src: '../img/xiongchumo/sprites.png'},
            {id: 'spritesData', src: './data/sprites.json'}
        ],
        function (d) {

            var stage = game.createStage({
                name: 'xiongchumo-stage',
                captureFunc: function (e) {
                },
                releaseFunc: function (e) {
                }
            });

            var bgData = d.spritesData.bg;
            var bgSpriteSheet = new ig.SpriteSheet({
                name: 'bg',
                image: d.bgImg,
                sX: bgData.sX,
                sY: bgData.sY,
                total: bgData.total,
                tileW: bgData.tileW,
                tileH: bgData.tileH,
                cols: bgData.cols,
                rows: bgData.rows,
                zIndex: 1,
                ticksPerFrame: 1.5,
                vX: 1,
                vY: 1,
                captureFunc: function (d) {
                    // console.warn(d);
                    // console.warn(this);
                },
                moveFunc: function (d) {
                    // this.move(d.x, d.y);
                }
            });

            stage.addDisplayObject(bgSpriteSheet);

            var normalRunData = d.spritesData.normalRun;
            var peopleSheet = new ig.SpriteSheet({
                name: 'people',
                image: d.spritesImg,
                x: (game.width - normalRunData.tileW) / 2,
                y: 150,
                sX: normalRunData.sX,
                sY: normalRunData.sY,
                total: normalRunData.total,
                tileW: normalRunData.tileW,
                tileH: normalRunData.tileH,
                cols: normalRunData.cols,
                rows: normalRunData.rows,
                zIndex: 2,
                ticksPerFrame: 3,
                captureFunc: function (d) {
                    // console.warn(d);
                    // console.warn(this);
                },
                moveFunc: function (d) {
                    // this.move(d.x, d.y);
                }
            });

            // var test = 1;
            // peopleSheet.update = function (dt) {
            //     test++;
            //     if (test % 30 === 0) {
            //         this.scaleX += 0.1;
            //         this.scaleY += 0.1;
            //     }
            // };

            stage.addDisplayObject(peopleSheet);


            var bearData = d.spritesData.bear;
            var bearSheet = new ig.SpriteSheet({
                name: 'bear',
                image: d.spritesImg,
                x: (game.width - bearData.tileW) / 2,
                y: -10,
                sX: bearData.sX,
                sY: bearData.sY,
                total: bearData.total,
                tileW: bearData.tileW,
                tileH: bearData.tileH,
                cols: bearData.cols,
                rows: bearData.rows,
                zIndex: 1,
                ticksPerFrame: 5,
                scaleX: 0.1,
                scaleY: 0.1,
                captureFunc: function (d) {
                    // console.warn(d);
                    // console.warn(this);
                },
                moveFunc: function (d) {
                    // this.move(d.x, d.y);
                }
            });

            bearSheet.update = function (dt) {
                if (this.scaleX.toFixed(1) === '1.2') {
                    return;
                }
                this.scaleX += 0.01;
                this.scaleY += 0.01;
                this.y += 0.5;
            };

            stage.addDisplayObject(bearSheet);

            game.start();
        }
    );
};
