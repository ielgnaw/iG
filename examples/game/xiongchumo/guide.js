/* global ig */

'use strict';

/**
 * 引导模块
 *
 * @return {Object} 模块暴露的接口
 */
var guide = (function () {

    var CONFIG = ig.getConfig();
    var STATUS = CONFIG.status;

    var game;
    var stage;

    /**
     * 初始化第一个 guide 界面
     */
    function initGuideStep1() {
        var left = new ig.Bitmap({
            name: 'leftArrow',
            asset: game.asset.spritesImg,
            x: -110 * game.ratioX,
            sx: 305,
            sy: 455,
            width: 110,
            sWidth: 110,
            height: 60,
            sHeight: 60,
            zIndex: 14,
            // debug: 1,
        });

        var right = new ig.Bitmap({
            name: 'rightArrow',
            asset: game.asset.spritesImg,
            x: 110 * game.ratioX,
            sx: 500,
            sy: 455,
            width: 110,
            sWidth: 110,
            height: 60,
            sHeight: 60,
            zIndex: 14,
            // debug: 1,
        });

        var huaText = new ig.Bitmap({
            name: 'huaText',
            asset: game.asset.spritesImg,
            x: 110 * game.ratioX,
            y: -100 * game.ratioY,
            sx: 801,
            sy: 758,
            width: 110,
            sWidth: 110,
            height: 95,
            sHeight: 95,
            zIndex: 14,
            alpha: 0,
            // debug: 1,
        });

        huaText.setAnimate({
            target: {
                alpha: 1
            },
            jumpFrames: 1,
            duration: 500,
            completeFunc: function (e) {
            }
        });

        var guideStep1 = stage.addDisplayObject(
            new ig.Bitmap({
                name: 'guideStep1',
                asset: game.asset.spritesImg,
                x: (game.width - 110) / 2,
                y: 220 * game.ratioY,
                sx: 390,
                sy: 305,
                width: 110,
                sWidth: 110,
                height: 140,
                sHeight: 140,
                zIndex: 15,
                children: [left, right, huaText]
            })
        );

        guideStep1.setAnimate({
            target: {
                x: guideStep1.x - 50
            },
            jumpFrames: 1,
            duration: 500,
            completeFunc: function (e) {
                guideStep1.setAnimate({
                    target: {
                        x: guideStep1.x + 100
                    },
                    duration: 800,
                    completeFunc: function () {
                        guideStep1.setAnimate({
                            target: {
                                x: guideStep1.x - 50
                            },
                            duration: 500,
                            completeFunc: function () {
                                guideStep1.setStatus(STATUS.DESTROYED)
                            }
                        });
                    }
                });
            }
        });
    }

    function setup(opts) {
        game = opts.game;
        stage = opts.stage;
    }

    return {
        setup: setup,
        initGuideStep1: initGuideStep1
    }
})();
