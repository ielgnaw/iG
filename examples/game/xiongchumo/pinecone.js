/* global ig */

'use strict';

/**
 * 松果模块
 *
 * @return {Object} 模块暴露的接口
 */
var pinecone = (function () {

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
    var pineconeWidth = 50;
    var guid = 0;

    var pineconeCount = 0;

    var superText;

    function _create(isLoop) {
        if (isLoop) {
            pineconeCount++;
        }
        var x = util.randomInt(0, game.width - pineconeWidth);
        // var x = 100;
        var vx = ((game.width - pineconeWidth) / 2 - x) / (game.height);

        var p = new ig.SpriteSheet({
            name: 'pinecone' + (guid++),
            asset: game.asset.spritesImg,
            sheetData: spritesData.pinecone,
            sheetKey: 'pinecone',
            jumpFrames: 4,
            zIndex: 5,
            y: game.height - 50,
            width: 50,
            height: 50,
            vy: -3 * game.ratioY,
            x: x,
            vx: vx * game.ratioX * 3,
            alpha: (player.runStatus === 'super' ? 0 : 1)
            // debug: 1,
        });

        // isLoop 存在说明不是引导模式
        if (isLoop && player.runStatus !== 'super') {
            pineconeCount = 0;

            var q = util.randomInt(0, 100);
            // 超级药水
            if (q % 3 === 0) {
                p = new ig.Bitmap({
                    name: 'pinecone' + (guid++),
                    asset: game.asset.spritesImg,
                    zIndex: 5,
                    y: game.height - 50,
                    vy: -3 * game.ratioY,
                    x: x,
                    vx: vx * game.ratioX * 3,
                    sx: 570,
                    sy: 314,
                    width: 50,
                    sWidth: 50,
                    height: 65,
                    sHeight: 65,
                    // alpha: (player.runStatus === 'super' ? 0 : 1)
                });
            }
        }

        p.step = function (dt, stepCount, requestID) {
            this.vx += this.ax * dt;
            this.vx *= this.frictionX * dt;
            this.vy += this.ay * dt;
            this.vy *= this.frictionY * dt;

            this.x += this.vx * dt;
            this.y += this.vy * dt;

            this.move(this.x, this.y);
            this.setScale(this.scaleX - scaleRatio, this.scaleY - scaleRatio);

            var bear = stage.getDisplayObjectByName('bear');

            if (this.collidesWith(player)
                && player.runStatus !== 'super'
                && (this.y) <= (player.y + player.height - 30 * game.ratioY)
                && (this.y) >= (player.y + player.height - 40 * game.ratioY)
            ) {
                var x = this.x;
                var y = this.y;
                var width = this.width;
                var height = this.height;

                if (x <= player.x + player.width - width / 2 && player.x < x + width - width / 2) {
                    this.setStatus(STATUS.DESTROYED);

                    if (bear && bear.runStatus === 'complete') {
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

                    stage.addDisplayObject(
                        new ig.SpriteSheet({
                            name: 'boom_' + Date.now(),
                            asset: game.asset.boomImg,
                            sheetData: boomData,
                            jumpFrames: 2.5,
                            x: x - width / 2,
                            y: y - height,
                            // y: y - player.y + player.height, // + player.height / 3,
                            zIndex: 10,
                            width: 100 * game.ratioX,
                            height: 100 * game.ratioY,
                            isOnceDestroyed: true,
                            onceDestroyedDone: function () {
                                if (isLoop) {
                                    var timeout = setTimeout(function () {
                                        clearTimeout(timeout);
                                        _create(isLoop);
                                    }, util.randomInt(2000, 5000));
                                }

                                // 吃到超级松果
                                if (p instanceof ig.Bitmap) {
                                    game.increaseMeter = 10;
                                    var bg = stage.getDisplayObjectByName('bg');
                                    var player = stage.getDisplayObjectByName('player');
                                    bg.jumpFrames = 0;
                                    player.jumpFrames = 2;
                                    player.runStatus = 'super';

                                    superText = new ig.Bitmap({
                                        name: 'superText' + Date.now(),
                                        asset: game.asset.spritesImg,
                                        x: (game.width - 273) / 2,
                                        y: -100,
                                        sx: 646,
                                        sy: 885,
                                        width: 273,
                                        sWidth: 273,
                                        height: 45,
                                        sHeight: 45,
                                        zIndex: 20,
                                    });

                                    superText.setAnimate({
                                        target: {
                                            y: 10 * game.ratioY,
                                        },
                                        duration: 500,
                                        tween: ig.easing.easeOutBounce
                                    });

                                    stage.addDisplayObject(superText);

                                    if (bear) {
                                        bear.jumpFrames = 10;
                                        bear.y = bear.backupY;
                                        bear.scaleX = bear.backupScaleX;
                                        bear.scaleY = bear.backupScaleY;
                                    }

                                    var timeout1 = setTimeout(function () {
                                        clearTimeout(timeout1);
                                        superText.setStatus(STATUS.DESTROYED);
                                        game.increaseMeter = 1;
                                        bear && (bear.jumpFrames = 7);
                                        bg.jumpFrames = 1.2;
                                        player.jumpFrames = 4;
                                        player.runStatus = 'normal';
                                        player.y = player.backupY;
                                        player.change(
                                            util.extend(
                                                true,
                                                {
                                                    width: 48,
                                                    status: STATUS.NORMAL,
                                                    asset: game.asset.spritesImg
                                                },
                                                spritesData.normalRun
                                            )
                                        );
                                    }, 7000);
                                }
                            }
                        })
                    );
                }
            }

            if (this.collidesWith(bear)
                && player.runStatus !== 'super'
                && bear.runStatus === 'complete'
                && (this.y) <= (bear.y + bear.height - 30 * game.ratioY)
                && (this.y) >= (bear.y + bear.height - 40 * game.ratioY)
            ) {
                var x = this.x;
                var y = this.y;
                var width = this.width;
                var height = this.height;

                this.setStatus(STATUS.DESTROYED);

                // 吃到超级松果
                if (p instanceof ig.Bitmap) {
                    bear.y += game.ratioY * 2;
                    bear.setScale(
                        (parseFloat(bear.scaleX) + 0.3).toFixed(1),
                        (parseFloat(bear.scaleY) + 0.3).toFixed(1)
                    );
                }
                else {
                    bear.y += game.ratioY;
                    bear.setScale(
                        (parseFloat(bear.scaleX) + 0.1).toFixed(1),
                        (parseFloat(bear.scaleY) + 0.1).toFixed(1)
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

                var boomBearPinecone = new ig.Bitmap({
                    name: 'boomBearPinecone_' + Date.now(),
                    asset: game.asset.spritesImg,
                    // x: game.ratioX * (bear.x), // + bear.width / 2,
                    x: (game.width - 140) / 2,
                    y: bear.y + bear.height / 2,
                    sx: 10,
                    sy: 430,
                    width: 140,
                    sWidth: 140,
                    height: 90,
                    sHeight: 90,
                    zIndex: 10,
                    // debug: 1
                });
                boomBearPinecone.setAnimate({
                    target: {
                        alpha: 0,
                        y: 3 * game.ratioY,
                    },
                    duration: 1000,
                    completeFunc: function (e) {
                        boomBearPinecone.setStatus(STATUS.DESTROYED);
                        if (isLoop) {
                            var t = setTimeout(function () {
                                clearTimeout(t);
                                _create(isLoop);
                            }, util.randomInt(4000, 8000));
                        }
                    }
                });
                stage.addDisplayObject(boomBearPinecone);
            }

            if (this.y < 100 * game.ratioY) {
                this.setStatus(STATUS.DESTROYED);
                if (isLoop) {
                    var t1 = setTimeout(function () {
                        clearTimeout(t1);
                        _create(isLoop);
                    }, util.randomInt(4000, 8000));
                }
            }
        };

        stage.addDisplayObject(p);

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
