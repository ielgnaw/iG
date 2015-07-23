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
                // alpha: (player.runStatus === 'super' ? 0 : 1)
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

            var isCollide = false;
            var x = this.x;
            var y = this.y;
            var width = this.width;
            var height = this.height;

            var bear = stage.getDisplayObjectByName('bear');

            if (this.collidesWith(player)
                && (this.y + this.height) >= (player.y + player.height)
                && player.runStatus !== 'super'
            ) {
                if (x <= player.x + player.width - width / 2 && player.x < x + width - width / 2) {
                    isCollide = true;
                    this.setStatus(STATUS.DESTROYED);

                    if (bear && bear.runStatus === 'complete') {
                        bear.y += game.ratioY;
                        bear.setScale(
                            (parseFloat(bear.scaleX) + 0.1).toFixed(1),
                            (parseFloat(bear.scaleY) + 0.1).toFixed(1)
                        );
                    }

                    player.change(util.extend(true, {
                        width: 55,
                        asset: game.asset.spritesImg,
                        status: STATUS.NORMAL
                    }, spritesData.tripRun));

                    player.setAnimate({
                        range: {
                            y: 10,
                        },
                        duration: 120,
                        repeat: 1,
                        repeatFunc: function (e) {
                            if (e.data.repeatCount === 2) {
                                e.target.stop();
                                e.target.paused = false;

                                // 这三行防止在跳起升空的过程中撞到石头无法恢复之前的状态
                                player.runStatus = 'normal';
                                player.y = player.backupY;
                                player.jumpFrames = 4;
                                player.change(
                                    util.extend(
                                        true,
                                        {
                                            width: 48,
                                            status: STATUS.NORMAL,
                                            asset: game.asset.spritesImg
                                        },
                                        (bear && bear.scaleX >= 1.7) ? spritesData.dangerRun : spritesData.normalRun
                                    )
                                );
                            }
                        }
                    });
                }
            }

            if (this.collidesWith(bear)
                && bear.runStatus === 'complete'
                && (this.y) <= (bear.y + bear.height - 30 * game.ratioY)
                && (this.y) >= (bear.y + bear.height - 40 * game.ratioY)
                && player.runStatus !== 'super'
            ) {
                isCollide = true;
                this.setStatus(STATUS.DESTROYED);

                if (bear.scaleX >= bear.backupScaleX) {
                    bear.y -= game.ratioY;
                    bear.setScale(
                        (parseFloat(bear.scaleX) - 0.1).toFixed(1),
                        (parseFloat(bear.scaleY) - 0.1).toFixed(1)
                    );
                }

                // 这三行防止在跳起升空的过程中撞到石头无法恢复之前的状态
                player.runStatus = 'normal';
                player.y = player.backupY;
                player.jumpFrames = 4;
                player.change(
                    util.extend(
                        true,
                        {
                            width: 48,
                            status: STATUS.NORMAL,
                            asset: game.asset.spritesImg
                        },
                        bear.scaleX >= 1.7 ? spritesData.dangerRun : spritesData.normalRun
                    )
                );
            }

            if (isCollide) {
                var breakStonePiece = stage.addDisplayObject(
                    new ig.Bitmap({
                        name: 'breakStonePiece_' + Date.now(),
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
                                name: 'breakStonePieceChild1_' + Date.now(),
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
                                name: 'breakStonePieceChild2_' + Date.now(),
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
                                name: 'breakStonePieceChild3_' + Date.now(),
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
                                name: 'breakStonePieceChild4_' + Date.now(),
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
                                name: 'breakStonePieceChild5_'+ Date.now(),
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
                        if (isLoop) {
                            var t = setTimeout(function () {
                                clearTimeout(t);
                                _create(isLoop);
                            }, util.randomInt(2000, 5000));
                        }
                    }
                };
            }

            if (this.y < 100 * game.ratioY) {
                this.setStatus(STATUS.DESTROYED);
                if (isLoop) {
                    var t1 = setTimeout(function () {
                        clearTimeout(t1);
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
