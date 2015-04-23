'use strict';

/* global ig */

window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var fpsNode = document.querySelector('#fps');

    var Game = ig.Game;
    var util = ig.util;
    var STATUS = ig.STATUS;

    var game = new ig.Game(
        {
            canvas: canvas,
            name: 'runner-game',
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
                id: 'wallBg',
                src: '/examples/img/runner-bg-wall.png'
            },
            {
                id: 'floorBg',
                src: '/examples/img/runner-bg-floor.png'
            },
            {
                id: 'playerData',
                src: './data/player.json'
            },
            {
                id: 'playerImg',
                src: '../img/runner-player.png'
            },
            {
                id: 'boxData',
                src: './data/box.json'
            },
            {
                id: 'boxImg',
                src: '../img/runner-box.png'
            }
        ],
        function (d) {

            function crouch(sprite) {
                sprite.changeFrame(ig.util.extend(true, {ticksPerFrame: 10, y: game.height - d.playerImg.height + 17}, playerCrouchData));
                sprite.isCrouch = 1;
            }

            function jump(sprite) {
                if (!sprite.isJump) {
                    sprite.changeFrame(ig.util.extend(true, {ticksPerFrame: 10}, playerJumpData));
                    sprite.isJump = 1;
                    var y = sprite.y;
                    sprite.setAnimate({
                        target: {
                            y: sprite.y - 170,
                        },
                        duration: 300,
                        completeFunc: function (evt) {
                            var cur = evt.data.source;
                            cur.setAnimate({
                                target: {
                                    y: cur.y + 170,
                                },
                                duration: 300,
                                completeFunc: function (evt1) {
                                    evt1.data.source.changeFrame(ig.util.extend(true, {ticksPerFrame: 10}, playerData));
                                    sprite.isJump = 0;
                                }
                            })
                        }
                    });
                }
            }

            var stage = game.createStage({
                name: 'stage-name',
                height: 500,
                captureFunc: function (e) {
                    var curPlayer = this.getDisplayObjectByName('player');
                    if (e.x > game.width / 2) {
                        jump(curPlayer);
                    }
                    else {
                        crouch(curPlayer);
                    }
                },
                releaseFunc: function (e) {
                    setTimeout(function () {
                        var curPlayer = stage.getDisplayObjectByName('player');
                        if (curPlayer.isCrouch) {
                            curPlayer.changeFrame(ig.util.extend(true, {ticksPerFrame: 10, y: game.height - d.playerImg.height}, playerData));
                            curPlayer.isCrouch = 0;
                        }
                    }, 100);
                }
            }).setParallax({
                image: d.wallBg,
                aX: 5,
                repeat: 'repeat'
            });
            game.start('stage-name');

            var spriteData = d.playerData;
            var isAdd = false;
            var scale = 0.01;

            var playerData = spriteData.player;
            var playerJumpData = spriteData.playerJump;
            var playerCrouchData = spriteData.playerCrouch;
            var player = new ig.SpriteSheet({
                // fillStyle: 'green',
                name: 'player',
                image: d.playerImg,
                x: 50,
                // y: stage.height / 2,
                y: game.height - d.playerImg.height,
                sX: playerData.sX,
                sY: playerData.sY,
                total: playerData.total,
                tileW: playerData.tileW,
                tileH: playerData.tileH,
                cols: playerData.cols,
                rows: playerData.rows,
                zIndex: 1,
                ticksPerFrame: 1,
                debug: 1,
                // vX: 1,
                // vY: 1,
            });

            stage.addDisplayObject(player);


            var box1Data = d.boxData.box1;
            var box = new ig.SpriteSheet({
                name: 'box1_' + Date.now(),
                image: d.boxImg,
                x: game.width + 10,
                // y: stage.height / 2,
                // y: game.height - d.boxImg.height - 10,
                y: game.height - d.boxImg.height - 90,
                sX: box1Data.sX,
                sY: box1Data.sY,
                total: box1Data.total,
                tileW: box1Data.tileW,
                tileH: box1Data.tileH,
                cols: box1Data.cols,
                rows: box1Data.rows,
                zIndex: 1,
                ticksPerFrame: 3,
                debug: 1,
                scaleX: 1.2,
                scaleY: 1.2,
                vX: -5,
                // vY: 1,
                captureFunc: function (e) {
                    jump(this);
                }
            });

            box.update = function () {
                this.angle = this.angle + 5;
                this.moveStep();

                if (this.bounds.x + this.bounds.width <= 0) {
                    this.changeStatus(STATUS.DESTROYED);
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
                if (!player.isJump) {
                    if (this.bounds.x >= player.bounds.x + player.bounds.width) {
                        boxCollidesWidthPlayer.call(this, player);
                    }
                }
                else {
                    if (this.bounds.x * 3 >= player.bounds.x + player.bounds.width) {
                        boxCollidesWidthPlayer.call(this, player);
                    }
                }
            }

            function boxCollidesWidthPlayer(player) {
                if (this.collidesWith(player)) {
                    this.vX = 5;
                    this.vY = -5;
                    this.setAnimate({
                        target: {
                            alpha: 0,
                        },
                        duration: 200,
                        completeFunc: function (evt) {
                            evt.data.source.changeStatus(STATUS.DESTROYED);
                        }
                    })
                }
            }
            stage.addDisplayObject(box);
        }
    );
};
