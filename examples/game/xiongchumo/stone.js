/* global ig */

'use strict';

/**
 * 石头模块
 *
 * @return {Object} 模块暴露的接口
 */
var stone = (function () {

    var util = ig.util;
    var CONFIG = ig.getConfig();
    var STATUS = CONFIG.status;
    var abs = Math.abs;

    var game;
    var stage;
    var player;
    var spritesData;
    var boomData;

    var scaleRatio = 1;
    var stoneWidth = 50;
    var guid = 0;

    function _create(isLoop) {
        var x = util.randomInt(0, game.width - stoneWidth);
        // var x = 100;
        var vx = ((game.width - stoneWidth) / 2 - x) / (game.height);
        var p = stage.addDisplayObject(
            new ig.SpriteSheet({
                name: 'stone' + (guid++),
                asset: game.asset.spritesImg,
                sheetData: spritesData.stone,
                sheetKey: 'stone',
                jumpFrames: 4,
                zIndex: 5,
                y: game.height - 50,
                // width: 50,
                // height: 50,
                vy: -3 * game.ratioY,
                x: x,
                vx: vx * game.ratioX * 3,
                scaleX: 1.3,
                scaleY: 1.3,
                // debug: 1,
            })
        );

        p.step = function (dt, stepCount, requestID) {
            this.vx += this.ax * dt;
            this.vx *= this.frictionX * dt;
            this.vy += this.ay * dt;
            this.vy *= this.frictionY * dt;

            this.x += this.vx * dt;
            this.y += this.vy * dt;

            this.move(this.x, this.y);
            this.setScale(this.scaleX - scaleRatio, this.scaleY - scaleRatio);

            if (this.collidesWith(player)
                // && (player.y + player.height) > (this.y + this.height)
                // && (player.y + player.height / 2) < (this.y + this.height)
                && (this.y + this.height) >= (player.y + player.height)
            ) {
                var x = this.x;
                var y = this.y;
                var width = this.width;
                var height = this.height;

                if (x <= player.x + player.width - width / 2 && player.x < x + width - width / 2) {
                    this.setStatus(STATUS.DESTROYED);
                    player.change(util.extend(true, {width: 55}, spritesData.tripRun));
                    // player.move(player.x, player.y + 10);
                    player.setAnimate({
                        target: {
                            y: player.y - 10,
                            // alpha: 0
                        },
                        duration: 100,
                        completeFunc: function (e) {
                            player.setAnimate({
                                target: {
                                    y: player.y + 10,
                                    // alpha: 1
                                },
                                duration: 100,
                                completeFunc: function (e) {
                                    player.setAnimate({
                                        target: {
                                            y: player.y - 10,
                                            // alpha: 0
                                        },
                                        duration: 100,
                                        completeFunc: function (e) {
                                            player.setAnimate({
                                                target: {
                                                    y: player.y + 10,
                                                    // alpha: 1
                                                },
                                                duration: 100,
                                                completeFunc: function (e) {
                                                    player.change(util.extend(true, {width: 48}, spritesData.normalRun));
                                                    // player.move(player.x, player.y - 10);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });

                    var breakStonePiece = stage.addDisplayObject(
                        new ig.Bitmap({
                            name: 'breakStonePiece',
                            asset: game.asset.spritesImg,
                            x: x - 10,
                            y: y,
                            sx: 327,
                            sy: 428,
                            width: 23,
                            sWidth: 23,
                            height: 20,
                            sHeight: 20,
                            zIndex: 10,
                            children: [
                                // 右
                                new ig.Bitmap({
                                    name: 'breakStonePieceChild1',
                                    asset: game.asset.spritesImg,
                                    x: 10,
                                    y: 10,
                                    sx: 350,
                                    sy: 428,
                                    width: 23,
                                    sWidth: 23,
                                    height: 20,
                                    sHeight: 20,
                                    zIndex: 10,
                                }),
                                // 左
                                new ig.Bitmap({
                                    name: 'breakStonePieceChild2',
                                    asset: game.asset.spritesImg,
                                    x: 30,
                                    y: 30,
                                    sx: 305,
                                    sy: 428,
                                    width: 23,
                                    sWidth: 23,
                                    height: 20,
                                    sHeight: 20,
                                    zIndex: 10,
                                }),
                                new ig.Bitmap({
                                    name: 'breakStonePieceChild3',
                                    asset: game.asset.spritesImg,
                                    x: 40,
                                    y: 25,
                                    sx: 350,
                                    sy: 428,
                                    width: 23,
                                    sWidth: 23,
                                    height: 20,
                                    sHeight: 20,
                                    zIndex: 10,
                                }),
                                new ig.Bitmap({
                                    name: 'breakStonePieceChild4',
                                    asset: game.asset.spritesImg,
                                    x: 50,
                                    y: 10,
                                    sx: 305,
                                    sy: 428,
                                    width: 23,
                                    sWidth: 23,
                                    height: 20,
                                    sHeight: 20,
                                    zIndex: 10,
                                }),
                                new ig.Bitmap({
                                    name: 'breakStonePieceChild5',
                                    asset: game.asset.spritesImg,
                                    x: 60,
                                    y: 0,
                                    sx: 327,
                                    sy: 428,
                                    width: 23,
                                    sWidth: 23,
                                    height: 20,
                                    sHeight: 20,
                                    zIndex: 10,
                                })
                            ]
                        })
                    );

                    breakStonePiece.step = function () {
                        this.move(this.x, this.y - 2);
                        this.scaleX -= 0.02;
                        this.scaleY -= 0.02;
                        this.alpha -= 0.1;
                        if (this.alpha < 0) {
                            this.alpha = 1;
                        }
                        for (var i = 0, len = this.children.length; i < len; i++) {
                            this.children[i].alpha = this.alpha;
                        }
                        if (this.scaleX.toFixed(2) === '0.00' || this.scaleX.toFixed(2) === '-0.00') {
                            this.setStatus(STATUS.DESTROYED);
                        }
                    };
                }
            }

            if (this.y < 100 * game.ratioY) {
                this.setStatus(STATUS.DESTROYED);
                if (isLoop) {
                    setTimeout(function () {
                        _create(isLoop);
                    }, util.randomInt(2000, 5000));
                }
            }
        };
    }

    var exports = {};

    exports.create = function () {
        _create();
    };

    exports.loopCreate = function () {
        _create(true);
    };

    exports.setup = function (opts) {
        game = opts.game;
        stage = opts.stage;
        player = opts.player;
        spritesData = opts.spritesData;
        boomData = opts.boomData;
        scaleRatio = Math.max(0.006 / game.ratioX, 0.006 / game.ratioY);
    };

    return exports;

})();
