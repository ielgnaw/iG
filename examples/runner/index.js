/* global ig */
'use strict';
window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var fpsNode = document.querySelector('#fps');
    // alert(window.orientation)
    var Game = ig.Game;
    var SpriteSheet = ig.SpriteSheet;
    var util = ig.util;
    var STATUS = ig.STATUS;

    var game = new Game(
        {
            canvas: canvas,
            name: 'runner-game',
            fps: 50,
            // maxWidth: 300,
            // height: 500
            maximize: 1
        }
    ).on('gameFPS', function (d) {
        fpsNode.innerHTML = 'fps: ' + d.data.fps;
    });

    game.loadResource(
        [
            {id: 'wallBg', src: '/examples/img/runner-bg-wall.png'},
            {id: 'playerData', src: './data/player.json'},
            {id: 'playerImg', src: '/examples/img/runner-player.png'},
            {id: 'boxData', src: './data/box.json'},
            {id: 'boxImg', src: '/examples/img/runner-box.png'}
        ],
        function (d) {
            var playerImg = d.playerImg;
            function crouch(sprite) {
                if (!sprite.isJump && !sprite.isCrouch) {
                    var y = game.height - playerImg.height + 21;
                    sprite.changeFrame(util.extend(true, {ticksPerFrame: 1, y: y}, playerCrouchData));
                    sprite.isCrouch = 1;
                }
            }

            function jump(sprite) {
                if (!sprite.isJump && !sprite.isCrouch) {
                    sprite.changeFrame(util.extend(true, {ticksPerFrame: 1}, playerJumpData));
                    sprite.isJump = 1;
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
                                    evt1.data.source.changeFrame(util.extend(true, {ticksPerFrame: 1}, playerData));
                                    sprite.isJump = 0;
                                }
                            });
                        }
                    });
                }
            }

            function boxCollidesWidthPlayer(player) {
                if (this.collidesWith(player)) {
                    this.vX = 5;
                    this.vY = -5;
                    stage.parallax.aX = 3;
                    if (!player.isCrouch) {
                        player.changeFrame(util.extend(true, {ticksPerFrame: 1}, playerCollisionData));
                    }
                    // player.x = player.x - 3;
                    // console.warn(player.x);
                    this.setAnimate({
                        target: {
                            alpha: 0,
                        },
                        duration: 300,
                        completeFunc: function (evt) {
                            evt.data.source.changeStatus(STATUS.DESTROYED);
                            stage.parallax.aX = 5;
                            player.changeFrame(
                                util.extend(true, {ticksPerFrame: 1}, playerData)
                            );
                        }
                    });
                }
            }

            var stage = game.createStage({
                name: 'stage-name',
                captureFunc: function (e) {
                    var domEvent = e.domEvent;
                    // domEvent.preventDefault();
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
                            curPlayer.changeFrame(
                                util.extend(true, {ticksPerFrame: 1, y: game.height - playerImg.height}, playerData)
                            );
                            curPlayer.isCrouch = 0;
                        }
                    }, 100);
                }
            }).setParallax({
                image: d.wallBg,
                aX: 5,
                aY: 5,
                repeat: 'repeat'
            });
            game.start('stage-name1');

            var playerData = d.playerData.player;
            var playerJumpData = d.playerData.playerJump;
            var playerCrouchData = d.playerData.playerCrouch;
            var playerCollisionData = d.playerData.playerCollision;
            var player = new SpriteSheet({
                name: 'player',
                image: playerImg,
                x: 150,
                y: game.height - playerImg.height,
                sX: playerData.sX,
                sY: playerData.sY,
                total: playerData.total,
                tileW: playerData.tileW,
                tileH: playerData.tileH,
                cols: playerData.cols,
                rows: playerData.rows,
                zIndex: 1,
                ticksPerFrame: 1,
                // debug: 1
            });
            stage.addDisplayObject(player);

            var boxDatas = [
                d.boxData.box1,
                d.boxData.box2
            ];

            function createBox() {
                if (stage.getDisplayObjectList().length > 3) {
                    return;
                }
                var boxData = boxDatas[util.randomInt(0, boxDatas.length - 1)];
                var box = new ig.SpriteSheet({
                    image: d.boxImg,
                    x: game.width + 10,
                    y: util.randomInt(game.height - d.boxImg.height - 10, game.height - d.boxImg.height - 150),
                    // y: game.height - d.boxImg.height - 30,
                    sX: boxData.sX,
                    sY: boxData.sY,
                    total: boxData.total,
                    tileW: boxData.tileW,
                    tileH: boxData.tileH,
                    cols: boxData.cols,
                    rows: boxData.rows,
                    zIndex: 1,
                    ticksPerFrame: 1,
                    vX: util.randomInt(-5, -20),
                    // debug:1
                    // vX: util.randomInt(-15, -19)
                    // vX: -50
                });
                box.update = function () {
                    this.angle = this.angle + 5;
                    this.moveStep();

                    if (this.bounds.x + this.bounds.width <= 0) {
                        this.changeStatus(STATUS.DESTROYED);
                    }
                    boxCollidesWidthPlayer.call(this, player);
                };
                stage.addDisplayObject(box);
            }

            var now;
            var then = Date.now();
            var interval = 1000 / game.fps;
            var delta;
            var tickUpdateCount = 0;
            var ticksPerFrame = 40;
            function tick() {
                window.requestAnimationFrame(tick);
                now = Date.now();
                delta = now - then;
                if (delta > interval) {
                    tickUpdateCount++;
                    then = now - (delta % interval);
                    if (tickUpdateCount > ticksPerFrame) {
                        tickUpdateCount = 0;
                        createBox();
                    }
                }
            }
            tick();
        }
    );
};
