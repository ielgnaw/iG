window.onload = function () {
    console.warn('start time 23:33');
    console.warn('end time 23:55');
    var canvas = document.querySelector('#canvas');
    var fpsNode = document.querySelector('#fps');

    var Game = ig.Game;
    var SpriteSheet = ig.SpriteSheet;
    var Stage = ig.Stage;
    var util = ig.util;
    var STATUS = ig.STATUS;

    var game = new Game({
        canvas: canvas,
        maximize: 1
    }).on('gameFPS', function (d) {
        fpsNode.innerHTML = 'fps: ' + d.data.fps;
    });

    game.loadResource(
        [
            {id: 'wallBg', src: '/examples/img/runner-bg-wall.png'},
            {id: 'playerImg', src: '/examples/img/runner-player.png'},
            {id: 'boxImg', src: '/examples/img/runner-box.png'},
            {id: 'playerData', src: './data/player.json'},
            {id: 'boxData', src: './data/box.json'}
        ],
        function (d) {

            function jump(player) {
                if (!player.isJump && !player.isCrouch) {
                    player.changeFrame(playerJumpData);
                    player.isJump = 1;
                    player.setAnimate({
                        target: {
                            y: player.y - 170
                        },
                        duration: 300,
                        completeFunc: function (e) {
                            var cur = e.data.source;
                            cur.setAnimate({
                                target: {
                                    y: cur.y + 170
                                },
                                duration: 300,
                                completeFunc: function (evt) {
                                    evt.data.source.changeFrame(playerData);
                                    player.isJump = 0;
                                }
                            })
                        }
                    });
                }
            }

            function crouch(player) {
                if (!player.isJump && !player.isCrouch) {
                    var y = game.height - playerImg.height + 21;
                    player.changeFrame(util.extend(true, {y: y}, playerCrouchData));
                    player.isCrouch = 1;
                }
            }

            var stage = game.createStage({
                captureFunc: function (e) {
                    var domEvent = e.domEvent;
                    var cur = this.getDisplayObjectByName('player');
                    if (e.x > game.width / 2) {
                        jump(cur);
                    }
                    else {
                        crouch(cur);
                    }
                },
                releaseFunc: function (e) {
                    setTimeout(function () {
                        var cur = stage.getDisplayObjectByName('player');
                        if (cur.isCrouch) {
                            cur.changeFrame(
                                util.extend(true, {y: game.height - playerImg.height}, playerData)
                            );
                            cur.isCrouch = 0;
                        }
                    }, 100);
                },
            }).setParallax({
                image: d.wallBg,
                aX: 5,
                repeat: 'repeat'
            });

            game.start();

            var playerData = d.playerData.player;
            var playerJumpData = d.playerData.playerJump;
            var playerCrouchData = d.playerData.playerCrouch;
            var playerCollisionData = d.playerData.playerCollision;
            var playerImg = d.playerImg;

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
                offsetX: playerData.offsetX,
                offsetY: playerData.offsetY,
                ticksPerFrame: 1
            });

            stage.addDisplayObject(player);

            var boxDatas = [
                d.boxData.box1,
                d.boxData.box2
            ];

            function createBox() {
                var boxData = boxDatas[util.randomInt(0, boxDatas.length - 1)];
                var box = new SpriteSheet({
                    image: d.boxImg,
                    x: game.width + 10,
                    y: util.randomInt(game.height - d.boxImg.height - 10, game.height - d.boxImg.height - 150),
                    sX: boxData.sX,
                    sY: boxData.sY,
                    total: boxData.total,
                    tileW: boxData.tileW,
                    tileH: boxData.tileH,
                    cols: boxData.cols,
                    rows: boxData.rows,
                    offsetX: boxData.offsetX,
                    offsetY: boxData.offsetY,
                    vX: util.randomInt(-5, -20),
                    ticksPerFrame: 1
                });

                box.update = function () {
                    this.angle += 5;
                    this.moveStep();
                    if (this.bounds.x + this.bounds.width <= 0) {
                        this.changeStatus(STATUS.DESTROYED);
                    }
                    boxCollidesWithPlayer.call(this, player);
                };

                stage.addDisplayObject(box);
            }

            function boxCollidesWithPlayer(player) {
                if (this.collidesWith(player)) {
                    this.vX = 5;
                    this.vY = -5;
                    stage.parallax.aX = 3;
                    if (!player.isCrouch) {
                        player.changeFrame(playerCollisionData);
                    }

                    this.setAnimate({
                        target: {
                            alpha: 0
                        },
                        duration: 300,
                        completeFunc: function (e) {
                            e.data.source.changeStatus(STATUS.DESTROYED);
                            stage.parallax.aX = 5;
                            if (!player.isCrouch) {
                                player.changeFrame(playerData);
                            }
                        }
                    });
                }
            }

            var updateCount = 0;
            var perFrame = 40;
            function tick() {
                window.requestAnimationFrame(tick);
                updateCount++;
                if (updateCount > perFrame) {
                    updateCount = 0;
                    createBox();
                }
            }
            tick();

        }
    );
};
