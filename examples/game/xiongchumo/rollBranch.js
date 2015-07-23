/* global ig */

'use strict';

/**
 * 滚动的原木模块
 *
 * @return {Object} 模块暴露的接口
 */
var rollBranch = (function () {

    var util = ig.util;
    var CONFIG = ig.getConfig();
    var STATUS = CONFIG.status;

    var game;
    var stage;
    var player;
    var spritesData;
    var spritesData1;
    var boomData;

    var scaleRatio = 1;
    var rollBranchWidth = 50;
    var guid = 0;

    function _create(isLoop) {
        var x = util.randomInt(0, game.width - rollBranchWidth);
        // var x = 100;
        // var vx = ((game.width - rollBranchWidth) / 2 - x) / (game.height);
        var p = stage.addDisplayObject(
            new ig.SpriteSheet({
                name: 'rollBranch' + (guid++),
                asset: game.asset.spritesImg1,
                sheetData: spritesData1.rollBranch,
                sheetKey: 'rollBranch',
                jumpFrames: 7,
                zIndex: 5,
                y: game.height - 45 * game.ratioY,
                width: game.width - 10,
                height: 45 * game.ratioY,
                vy: -3 * game.ratioY,
                // x: x,
                x: 10 * game.ratioX,
                // alpha: (player.runStatus === 'super' ? 0 : 1)
                // vx: vx * game.ratioX * 3,
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
            // console.warn(this.y, player.y + player.height, player.y + player.height - this.y);
            var isCollide = false;

            var x;
            var y;
            var bear = stage.getDisplayObjectByName('bear');
            var sub = Math.abs(player.y + player.height - this.y - this.height / 2);
            if (this.collidesWith(player) && sub >= 0 && sub <= 2 && player.runStatus !== 'super') {
                isCollide = true;
                this.setStatus(STATUS.DESTROYED);
                x = player.x - 100;
                y = player.y + player.height / 2 + 50;

                if (bear && bear.runStatus === 'complete') {
                    bear.y += game.ratioY;
                    bear.setScale(
                        (parseFloat(bear.scaleX) + 0.1).toFixed(1),
                        (parseFloat(bear.scaleY) + 0.1).toFixed(1)
                    );
                }

                player.change(
                    util.extend(true, {
                        width: 55,
                        jumpFrames: 4,
                        asset: game.asset.spritesImg,
                        status: STATUS.NORMAL
                    }, spritesData.tripRun)
                );

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
                                    bear && bear.scaleX >= 1.7 ? spritesData.dangerRun : spritesData.normalRun
                                )
                            );
                        }
                    }
                });
            }

            if (this.collidesWith(bear)
                && bear.runStatus === 'complete'
                && (this.y) <= (bear.y + bear.height - 30 * game.ratioY)
                && (this.y) >= (bear.y + bear.height - 40 * game.ratioY)
                && player.runStatus !== 'super'
            ) {
                isCollide = true;
                this.setStatus(STATUS.DESTROYED);
                x = bear.x - 100;
                y = bear.y + bear.height / 2 + 50;

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
                var breakBranchPiece = stage.addDisplayObject(
                    new ig.Bitmap({
                        name: 'breakBranchPiece_' + Date.now(),
                        asset: game.asset.spritesImg,
                        x: x,
                        y: y,
                        sx: 733,
                        sy: 171,
                        width: 168,
                        sWidth: 168,
                        height: 32,
                        sHeight: 32,
                        zIndex: 10,
                        // debug: 1,
                        children: [
                            // 右
                            new ig.Bitmap({
                                name: 'breakBranchPieceChild1_' + Date.now(),
                                asset: game.asset.spritesImg,
                                x: 100,
                                y: -7,
                                sx: 733,
                                sy: 201,
                                width: 160,
                                sWidth: 160,
                                height: 31,
                                sHeight: 31,
                                zIndex: 10,
                                followParent: 0,
                                angle: 10,
                                // debug: 1
                            }),
                            new ig.Bitmap({
                                name: 'breakBranchPieceChild2_' + Date.now(),
                                asset: game.asset.spritesImg,
                                x: 150,
                                y: -25,
                                sx: 733,
                                sy: 231,
                                width: 110,
                                sWidth: 110,
                                height: 19,
                                sHeight: 19,
                                followParent: 0,
                                zIndex: 10,
                                angle: -10,
                                // debug: 1
                            }),
                            new ig.Bitmap({
                                name: 'breakBranchPieceChild3_' + Date.now(),
                                asset: game.asset.spritesImg,
                                x: 30,
                                y: -25,
                                sx: 733,
                                sy: 250,
                                width: 182,
                                sWidth: 182,
                                height: 21,
                                sHeight: 21,
                                followParent: 0,
                                zIndex: 10,
                                angle: -10,
                                // debug: 1
                            })
                        ]
                    })
                );

                breakBranchPiece.step = function () {
                    this.move(this.x, this.y - 2);
                    this.scaleX -= 0.02;
                    this.scaleY -= 0.02;
                    this.alpha -= 0.1;
                    if (this.alpha < 0) {
                        this.alpha = 1;
                    }
                    for (var i = 0, len = this.children.length; i < len; i++) {
                        this.children[i].alpha = this.alpha;
                        this.children[i].scaleX = this.scaleX;
                        this.children[i].scaleY = this.scaleY;
                        this.children[i].move(this.children[i].x, this.children[i].y - 2);
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
        spritesData1 = opts.spritesData1;
        boomData = opts.boomData;
        scaleRatio = Math.max(0.006 / game.ratioX, 0.006 / game.ratioY);
    };

    return exports;

})();
