
'use strict';

/* global ig */


window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var util = ig.util;
    var STATUS = ig.STATUS;

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
            {id: 'spritesImg1', src: '../img/xiongchumo/sprites1.png'},
            {id: 'spritesData', src: './data/sprites.json'},
            {id: 'spritesData1', src: './data/sprites1.json'},
        ],
        function (d) {

            game.start();

            function right(player) {
                player.setAnimate({
                    target: {
                        x: player.x + 100
                    },
                    duration: 300,
                    completeFunc: function (e) {
                    }
                });
            }

            var stage = game.createStage({
                name: 'xiongchumo-stage',
                captureFunc: function (e) {
                },
                releaseFunc: function (e) {
                },
                moveFunc: function (e) {
                    var domEvent = e.domEvent;
                    domEvent.preventDefault();
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

            // var treeBranchData = d.spritesData1.treeBranch;
            // var treeBranchSheet = new ig.SpriteSheet({
            //     name: 'treeBranch_',
            //     image: d.spritesImg1,
            //     x: 46,
            //     // x: 100,
            //     // x: util.randomInt(46, 223),
            //     y: 300,
            //     sX: treeBranchData.sX,
            //     sY: treeBranchData.sY,
            //     total: treeBranchData.total,
            //     tileW: treeBranchData.tileW,
            //     tileH: treeBranchData.tileH,
            //     cols: treeBranchData.cols,
            //     rows: treeBranchData.rows,
            //     zIndex: 4,
            //     // debug: 1,
            //     ticksPerFrame: 4,
            //     captureFunc: function (d) {
            //         // console.warn(d);
            //         // console.warn(this);
            //     },
            //     moveFunc: function (d) {
            //         // this.move(d.x, d.y);
            //     }
            // });

            // stage.addDisplayObject(treeBranchSheet);

            var treeBranchBreakData = d.spritesData1.treeBranchBreak;
            var treeBranchBreakSheet = new ig.SpriteSheet({
                name: 'treeBranchBreak_',
                image: d.spritesImg1,
                x: 46,
                // x: 100,
                // x: util.randomInt(46, 223),
                y: 300,
                sX: treeBranchBreakData.sX,
                sY: treeBranchBreakData.sY,
                total: treeBranchBreakData.total,
                tileW: treeBranchBreakData.tileW,
                tileH: treeBranchBreakData.tileH,
                cols: treeBranchBreakData.cols,
                rows: treeBranchBreakData.rows,
                zIndex: 4,
                // debug: 1,
                ticksPerFrame: 4,
                captureFunc: function (d) {
                    // console.warn(d);
                    // console.warn(this);
                },
                moveFunc: function (d) {
                    // this.move(d.x, d.y);
                }
            });

            stage.addDisplayObject(treeBranchBreakSheet);
            return;


            var normalRunData = d.spritesData.normalRun;
            var playerSheet = new ig.SpriteSheet({
                name: 'player',
                image: d.spritesImg,
                x: (game.width - normalRunData.tileW) / 2,
                y: 120,
                sX: normalRunData.sX,
                sY: normalRunData.sY,
                total: normalRunData.total,
                tileW: normalRunData.tileW,
                tileH: normalRunData.tileH,
                cols: normalRunData.cols,
                rows: normalRunData.rows,
                zIndex: 2,
                ticksPerFrame: 3,
                // debug: 1,
                moveFunc: function (d) {
                    if (d.x > 46 && d.x < 223) {
                        this.move(d.x, this.y);
                    }
                }
            });

            stage.addDisplayObject(playerSheet);

            var bearData = d.spritesData.bear;
            var bearSheet = new ig.SpriteSheet({
                name: 'bear',
                image: d.spritesImg,
                x: (game.width - bearData.tileW) / 2,
                y: -40,
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
                // debug: 1,
                captureFunc: function (d) {
                    // console.warn(d);
                    // console.warn(this);
                },
                moveFunc: function (d) {
                    // this.move(d.x, d.y);
                }
            });

            stage.addDisplayObject(bearSheet);

            bearSheet.setAnimate({
                target: {
                    scaleX: 1.2,
                    scaleY: 1.2,
                    y: 25
                },
                duration: 2000,
                completeFunc: function (evt) {
                    // evt.data.source.changeStatus(STATUS.DESTROYED);
                }
            });

            ig.loop({
                ticksPerFrame: 130,
                exec: function (requestId) {
                    createPinecone(requestId);
                }
            });

            var treeBranchData = d.spritesData.treeBranch;
            console.warn(treeBranchData);
            var treeBranchSheet = new ig.SpriteSheet({
                name: 'treeBranch_',
                image: d.spritesImg,
                // x: 46,
                x: 0,
                // x: util.randomInt(46, 223),
                y: 100,
                sX: treeBranchData.sX,
                sY: treeBranchData.sY,
                total: treeBranchData.total,
                tileW: treeBranchData.tileW,
                tileH: treeBranchData.tileH,
                cols: treeBranchData.cols,
                rows: treeBranchData.rows,
                zIndex: 4,
                ticksPerFrame: 3,
                // debug: 1,
                // scaleX: 0.8,
                // scaleY: 0.8,
                captureFunc: function (d) {
                    // console.warn(d);
                    // console.warn(this);
                },
                moveFunc: function (d) {
                    // this.move(d.x, d.y);
                }
            });

            stage.addDisplayObject(treeBranchSheet);

            /**
             * 创建松果精灵
             */
            function createPinecone(requestId) {
                var pineconeData = d.spritesData.pinecone;
                var pineconeSheet = new ig.SpriteSheet({
                    name: 'pinecone_' + requestId,
                    image: d.spritesImg,
                    // x: 46,
                    x: 223,
                    // x: util.randomInt(46, 223),
                    y: game.height - pineconeData.tileH,
                    sX: pineconeData.sX,
                    sY: pineconeData.sY,
                    total: pineconeData.total,
                    tileW: pineconeData.tileW,
                    tileH: pineconeData.tileH,
                    cols: pineconeData.cols,
                    rows: pineconeData.rows,
                    zIndex: 3,
                    ticksPerFrame: 3,
                    // debug: 1,
                    scaleX: 0.8,
                    scaleY: 0.8,
                    captureFunc: function (d) {
                        // console.warn(d);
                        // console.warn(this);
                    },
                    moveFunc: function (d) {
                        // this.move(d.x, d.y);
                    }
                });

                pineconeSheet.update = function (dt) {
                    this.scaleX -= 0.01;
                    this.scaleY -= 0.01;
                    this.y -= 3;

                    pineconeCollide.call(this);
                };

                stage.addDisplayObject(pineconeSheet);

                /**
                 * 松果的碰撞
                 */
                function pineconeCollide() {
                    // 在 player 可以接松果的范围内，即松果还没有滚动到 player 后面
                    if (this.y > playerSheet.y + playerSheet.tileH - this.tileH) {
                        if (this.collidesWith(playerSheet) && !this.isCollide) {
                            this.isCollide = true;
                            this.changeFrame(d.spritesData.pineconeWithPlayer);
                            this.setAnimate({
                                target: {
                                    scaleX: 2,
                                    scaleY: 2,
                                    alpha: 0
                                },
                                duration: 400,
                                completeFunc: function (evt) {
                                    evt.data.source.changeStatus(STATUS.DESTROYED);
                                }
                            });
                            if (bearSheet.y.toFixed(0) > 8) {
                                bearSheet.y -= 2;
                                bearSheet.scaleX -= 0.1;
                                bearSheet.scaleY -= 0.1;
                            }
                        }
                    }
                    // 如果 player 没有碰到松果，那么熊一定会碰到
                    else {
                        if (this.y < bearSheet.y + bearSheet.tileH - this.tileH) {
                            if (this.collidesWith(bearSheet) && !this.isCollide) {
                                this.isCollide = true;
                                this.changeFrame(d.spritesData.pineconeWithBear);
                                this.setAnimate({
                                    target: {
                                        scaleX: 2,
                                        scaleY: 2,
                                        alpha: 0
                                    },
                                    duration: 400,
                                    completeFunc: function (evt) {
                                        evt.data.source.changeStatus(STATUS.DESTROYED);
                                    }
                                });
                                if (bearSheet.y.toFixed(0) < 32) {
                                    bearSheet.y += 2;
                                    bearSheet.scaleX += 0.1;
                                    bearSheet.scaleY += 0.1;
                                }
                                else {
                                    console.warn('被吃了');
                                }
                            }
                        }
                    }
                }

            }

        }
    );
};
