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
        // initGuideStep4();
        // return;
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

        var hua = new ig.Bitmap({
            name: 'hua',
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

        hua.setAnimate({
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
                children: [left, right, hua]
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
                                guideStep1.setStatus(STATUS.DESTROYED);
                                setTimeout(initGuideStep2, 2000);
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * 初始化顶部收集松果
     */
    function initGuideStep2() {
        var guideStep2 = stage.addDisplayObject(
            new ig.Bitmap({
                name: 'guideStep2',
                asset: game.asset.spritesImg,
                x: (game.width - 273) / 2,
                y: -100, // 10 * game.ratioY,
                sx: 0,
                sy: 938,
                width: 273,
                sWidth: 273,
                height: 66,
                sHeight: 66,
                zIndex: 15,
            })
        );

        guideStep2.setAnimate({
            target: {
                y: 20 * game.ratioY,
            },
            duration: 500,
            tween: ig.easing.easeOutBounce,
            completeFunc: function () {
                setTimeout(function () {
                    guideStep2.setAnimate({
                        target: {
                            alpha: 0
                        },
                        duration: 500,
                        completeFunc: function () {
                            guideStep2.setStatus(STATUS.DESTROYED);
                            pinecone.create();
                            setTimeout(function () {
                                pinecone.create();
                                setTimeout(initGuideStep3, 3000);
                            }, 3000)
                            // pinecone.loopCreate();
                        }
                    });
                }, 1500);
            }
        });
    }

    /**
     * 初始化顶部躲开石头
     */
    function initGuideStep3() {
        var guideStep3 = stage.addDisplayObject(
            new ig.Bitmap({
                name: 'guideStep3',
                asset: game.asset.spritesImg,
                x: (game.width - 273) / 2,
                y: -100, // 10 * game.ratioY,
                sx: 273,
                sy: 938,
                width: 273,
                sWidth: 273,
                height: 66,
                sHeight: 66,
                zIndex: 15,
            })
        );

        guideStep3.setAnimate({
            target: {
                y: 20 * game.ratioY,
            },
            duration: 500,
            tween: ig.easing.easeOutBounce,
            completeFunc: function () {
                setTimeout(function () {
                    guideStep3.setAnimate({
                        target: {
                            alpha: 0
                        },
                        duration: 500,
                        completeFunc: function () {
                            guideStep3.setStatus(STATUS.DESTROYED);
                            stone.create();
                            setTimeout(function () {
                                stone.create();
                                setTimeout(initGuideStep4, 3000);
                            }, 3000);
                            // stone.loopCreate();
                        }
                    });
                }, 1500);
            }
        });
    }

    /**
     * 初始化跳的 guide
     */
    function initGuideStep4() {
        var guideStep4 = stage.addDisplayObject(
            new ig.Bitmap({
                name: 'guideStep4',
                asset: game.asset.spritesImg,
                x: (game.width - 273) / 2,
                y: -100, // 10 * game.ratioY,
                sx: 546,
                sy: 938,
                width: 273,
                sWidth: 273,
                height: 66,
                sHeight: 66,
                zIndex: 15,
            })
        );

        guideStep4.setAnimate({
            target: {
                y: 20 * game.ratioY,
            },
            duration: 500,
            tween: ig.easing.easeOutBounce,
            completeFunc: function () {
                setTimeout(function () {
                    guideStep4.setAnimate({
                        target: {
                            alpha: 0
                        },
                        duration: 500,
                        completeFunc: function () {
                            guideStep4.setStatus(STATUS.DESTROYED);
                        }
                    });
                }, 1500);
            }
        });

        var top = new ig.Bitmap({
            name: 'topArrow',
            asset: game.asset.spritesImg,
            x: -80 * game.ratioX,
            sx: 500,
            sy: 310,
            width: 67,
            sWidth: 67,
            height: 110,
            sHeight: 110,
            zIndex: 14,
            // debug: 1,
        });

        var tiao = new ig.Bitmap({
            name: 'tiao',
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

        tiao.setAnimate({
            target: {
                alpha: 1
            },
            jumpFrames: 1,
            duration: 500,
            completeFunc: function (e) {
            }
        });

        var shou = stage.addDisplayObject(
            new ig.Bitmap({
                name: 'shou',
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
                children: [top, tiao]
            })
        );

        shou.setAnimate({
            target: [
                {
                    y: shou.y - 60,
                    alpha: 0
                },
                {
                    y: shou.y - 60,
                    alpha: 0
                }
            ],
            jumpFrames: 1,
            duration: 1000,
            completeFunc: function (e) {
                shou.setStatus(STATUS.DESTROYED);
                rollBranch.loopCreate();
                // rollBranch.create();
                // setTimeout(function () {
                    // rollBranch.create();
                    // setTimeout(initGuideStep4, 3000);
                // }, 3000);
                // setTimeout(function () {
                //     stone.create();
                //     setTimeout(initGuideStep4, 3000);
                // }, 3000);

                // guideStep1.setAnimate({
                //     target: {
                //         x: guideStep1.x + 100
                //     },
                //     duration: 800,
                //     completeFunc: function () {
                //         guideStep1.setAnimate({
                //             target: {
                //                 x: guideStep1.x - 50
                //             },
                //             duration: 500,
                //             completeFunc: function () {
                //                 guideStep1.setStatus(STATUS.DESTROYED);
                //                 setTimeout(initGuideStep2, 2000);
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

        // setInterval(function () {
            // stone.create();
        // }, 2000)
    }

    return {
        setup: setup,
        initGuideStep1: initGuideStep1
    };

})();
