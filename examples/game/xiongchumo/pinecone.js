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

    var game;
    var stage;
    var player;
    var spritesData;

    var scaleRatio = 1;
    var pineconeWidth = 50;
    var guid = 0;

    var exports = {};

    exports.createPinecone = function () {
        var x = util.randomInt(0, game.width - pineconeWidth);
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
                debug: 1,
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

            if (this.y < 100 * game.ratioY) {
                this.setStatus(STATUS.DESTROYED);
                setTimeout(exports.createPinecone, util.randomInt(1000, 10000));
            }
        };
    };

    exports.setup = function (opts) {
        game = opts.game;
        stage = opts.stage;
        player = opts.player;
        spritesData = opts.spritesData;
        scaleRatio = Math.max(0.005 / game.ratioX, 0.005 / game.ratioY);
    };

    return exports;

})();
