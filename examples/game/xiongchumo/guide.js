/* global ig */

'use strict';

/**
 * 引导模块
 *
 * @return {Object} 模块暴露的接口
 */
var guide = (function () {

    var game;
    var stage;


    function initGuideStep1() {
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
                zIndex: 11,
                // debug: 1,
                scaleX: 0.7,
                scaleY: 0.7,
            })
        );

        guideStep1.setAnimate({
            target:
                {
                    x: guideStep1.x - 50
                }
            ,
            jumpFrames: 1,
            duration: 500,
            completeFunc: function (e) {
                console.warn('done111');
                // debugger
                // guideStep1.setAnimate({
                //     target:
                //         {
                //             x: guideStep1.x + 100
                //         }
                //     ,
                //     duration: 800,
                //     completeFunc: function () {
                //         console.warn('done222');
                //         guideStep1.setAnimate({
                //             target:
                //                 {
                //                     x: guideStep1.x - 50
                //                 }
                //             ,
                //             duration: 500,
                //             completeFunc: function () {
                //                 console.warn('done');
                //             }
                //         });
                //     }
                // });
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
