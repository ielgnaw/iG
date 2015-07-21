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

    function _create(isLoop) {
        var x = util.randomInt(0, game.width - pineconeWidth);
        // var x = 100;
        var vx = ((game.width - pineconeWidth) / 2 - x) / (game.height);
        var p = stage.addDisplayObject(
            new ig.SpriteSheet({
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
                // && (this.y + this.height) >= (player.y + player.height)
                && (this.y) <= (player.y + player.height - 30 * game.ratioY)
                && (this.y) >= (player.y + player.height - 40 * game.ratioY)
            ) {
                var x = this.x;
                var y = this.y;
                var width = this.width;
                var height = this.height;

                if (x <= player.x + player.width - width / 2 && player.x < x + width - width / 2) {
                    this.setStatus(STATUS.DESTROYED);

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
                                    setTimeout(function () {
                                        _create(isLoop);
                                    }, util.randomInt(2000, 5000));
                                }
                            }
                        })
                    );
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
