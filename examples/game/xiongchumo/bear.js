/* global ig */

'use strict';

/**
 * 熊模块
 *
 * @return {Object} 模块暴露的接口
 */
var bear = (function () {

    var util = ig.util;
    var CONFIG = ig.getConfig();
    var STATUS = CONFIG.status;
    var abs = Math.abs;

    var game;
    var stage;
    var player;
    var spritesData;
    var spritesData1;
    var boomData;

    var scaleRatio = 1;
    var bearWidth = 50;
    var guid = 0;

    var exports = {};

    exports.create = function () {
        var bearData = spritesData.bear;
        var bear = stage.addDisplayObject(
            new ig.SpriteSheet({
                name: 'bear',
                asset: game.asset.spritesImg,
                sheetData: bearData,
                jumpFrames: 7,
                zIndex: 5,
                x: (game.width - bearData.tileW) / 2,
                y: 30 * game.ratioY,
                backupY: 60 * game.ratioY,
                scaleX: 0.3,
                scaleY: 0.3,
                backupScaleX: 1,
                backupScaleY: 1,
                alpha: 0
                // y: 100 * game.ratioY,
                // debug: 1,
            })
        );

        bear.setAnimate({
            target: {
                scaleX: 1.3,
                scaleY: 1.3,
                y: 60 * game.ratioY,
                alpha: 1
            },
            duration: 3000,
            completeFunc: function (e) {
                bear.runStatus = 'complete';
                if (!game._events.afterGameStep) {
                    game.on('afterGameStep', function (e) {
                        var resultText = stage.getDisplayObjectByName('resultText');
                        if (resultText) {
                            resultText.alpha = 1;
                            var score = resultText.getContent();
                            score = parseInt(score, 10) + game.increaseMeter + '米';
                            resultText.changeContent(score);
                            game.result = score;
                        }
                    });
                }

                pinecone.loopCreate();
                var t = setTimeout(function () {
                    clearTimeout(t);
                    rollBranch.loopCreate();
                    var t1 = setTimeout(function () {
                        clearTimeout(t1);
                        stone.loopCreate();
                    }, 3000);
                }, 3000);

                // pinecone.loopCreate();
            }
        });

        return bear;
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
