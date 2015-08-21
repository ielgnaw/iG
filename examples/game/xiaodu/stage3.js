/**
 * @file 第三个场景
 * @author ielgnaw(wuji0223@gmail.com)
 */

/* global ig */

'use strict';

var stage3 = (function () {
    var util = ig.util;
    var randomInt = util.randomInt;
    var CONFIG = ig.getConfig();
    var STATUS = CONFIG.status;
    var randomInt = util.randomInt;

    var arrowNode = $('.arrow-container');
    var awakeContainerNode = $('.awake-container');

    var game;
    var stage;
    var isStart;
    var baseZIndex;

    var robot;
    var inlineEddy;

    /**
     * 场景三新加的背景模块
     *
     * @return {Object} 模块暴露的接口
     */
    var bgControl = (function () {

        function createStage3Bg() {
            var asset = game.asset.stage3Bg;
            var stage3Bg = stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'stage3Bg',
                    asset: asset,
                    x: (game.width - asset.width) / 2, // 265 * game.ratioX,
                    y: (game.height - asset.height) / 2, // 50 * game.ratioY,
                    zIndex: baseZIndex - 1,
                })
            );
        }

        var exports = {};

        exports.create = function () {
            createStage3Bg();
        };

        return exports;
    })();

    /**
     * 星球模块
     *
     * @return {Object} 模块暴露的接口
     */
    var planetControl = (function () {

        function createPlanet1() {
            stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'sPlanet1',
                    asset: game.asset.sPlanet1,
                    x: 230 * game.ratioX,
                    y: 50 * game.ratioY,
                    zIndex: baseZIndex
                })
            );
        }

        function createPlanet3() {
            stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'bPlanet3',
                    asset: game.asset.bPlanet3,
                    x: 60 * game.ratioX,
                    y: 150 * game.ratioY,
                    zIndex: baseZIndex
                })
            );
        }

        var exports = {};

        exports.create = function () {
            createPlanet1();
            createPlanet3();
        };

        return exports;
    })();

    /**
     * 星星模块
     *
     * @return {Object} 模块暴露的接口
     */
    var starControl = (function () {
        function createStar1() {
            var star1 = stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'star1',
                    asset: game.asset.star1,
                    x: 180 * game.ratioX,
                    y: 100 * game.ratioY,
                    zIndex: baseZIndex
                })
            );

            star1.setAnimate({
                range: {
                    alpha: 1
                },
                repeat: 1,
                duration: 1000
            });
        }

        function createStar2() {
            var star2 = stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'star2',
                    asset: game.asset.star2,
                    x: 35 * game.ratioX,
                    y: 250 * game.ratioY,
                    zIndex: baseZIndex
                })
            );

            star2.setAnimate({
                range: {
                    alpha: 1
                },
                repeat: 1,
                duration: 900
            });
        }

        function createStar3() {
            var star3 = stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'star3',
                    asset: game.asset.star2,
                    x: 280 * game.ratioX,
                    y: 400 * game.ratioY,
                    zIndex: baseZIndex
                })
            );

            star3.setAnimate({
                range: {
                    scaleX: 0.3,
                    scaleY: 0.3,
                    alpha: 1,
                },
                repeat: 1,
                duration: 800
            });
        }

        var exports = {};

        exports.create = function () {
            createStar1();
            createStar2();
            createStar3();
        };

        return exports;
    })();

    /**
     * 文案模块
     *
     * @return {Object} 模块暴露的接口
     */
    var textControl = (function () {
        var exports = {
            create: function () {
                var text = stage.addDisplayObject(
                    new ig.Text({
                        name: 'text',
                        content: '可是刚出生的小度技能还不',
                        x: (game.width - 264) / 2,
                        y: (game.height - 230),// * game.ratioY,
                        size: 15,
                        zIndex: baseZIndex,
                        fillStyle: '#ffad26',
                        fontFamily: 'Arial,sans-serif',
                        alpha: 0,
                        useCache: false,
                        width: 264,
                        children: [
                            new ig.Text({
                                name: 'text2',
                                content: '够强大，由于程序错误，遗',
                                x: 0,
                                y: 30,
                                size: 15,
                                zIndex: baseZIndex,
                                alpha: 0,
                                fillStyle: '#ffad26',
                                useCache: false,
                                width: 264,
                                fontFamily: 'Arial,sans-serif'
                            }),
                            new ig.Text({
                                name: 'text3',
                                content: '落在了美丽的地球',
                                x: 0,
                                y: 60,
                                size: 15,
                                zIndex: baseZIndex,
                                alpha: 0,
                                fillStyle: '#ffad26',
                                useCache: false,
                                width: 264,
                                fontFamily: 'Arial,sans-serif',
                            })
                        ]
                    })
                );

                text.setAnimate({
                    target: {
                        alpha: 1,
                    },
                    duration: 2000,
                    completeFunc: function () {
                        var t = setTimeout(function () {
                            clearTimeout(t);
                            text.setAnimate({
                                target: {
                                    alpha: 0,
                                },
                                duration: 1000,
                                completeFunc: function () {
                                    robot2Control.create();
                                }
                            });
                        }, 2000);
                    }
                });
            }
        };
        return exports;
    })();

    /**
     * 地球模块
     *
     * @return {Object} 模块暴露的接口
     */
    var earthControl = (function () {

        function createEarth() {
            var asset = game.asset.earth;
            var earth = stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'earth',
                    asset: asset,
                    x: (game.width - asset.width) / 2,
                    y: game.height,
                    zIndex: baseZIndex
                })
            );

            earth.setAnimate({
                target: {
                    y: game.height - 120,
                },
                duration: 2000
            });

            earth.step = function (dt, stepCount, requestID) {
                this.angle -= 0.1;
            };

        }

        var exports = {};

        exports.create = function () {
            createEarth();
        };

        return exports;
    })();

    /**
     * 机器人模块
     *
     * @return {Object} 模块暴露的接口
     */
    var robot2Control = (function () {
        function createRobot2() {
            var asset = game.asset.robot2;

            var _robot2 = stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'robot2',
                    asset: game.asset.robot2,
                    x: (game.width - asset.width) / 2,
                    y: -asset.height,
                    scaleX: 0,
                    scaleY: 0,
                    zIndex: baseZIndex + 1
                })
            );

            _robot2.setAnimate({
                target: {
                    y: game.height - asset.height - 50,
                    scaleX: 1,
                    scaleY: 1,
                    angle: 720
                },
                duration: 1500,
                tween: ig.easing.easeOutBounce,
                completeFunc: function (e) {
                    var t = setTimeout(function () {
                        clearTimeout(t);
                        preSwitchStage();
                    }, 4000);
                }
            });
            return _robot2;
        }

        var exports = {};

        exports.create = function () {
            return createRobot2();
        };

        return exports;
    })();

    function preSwitchStage() {
        var stage3Bg = stage.getDisplayObjectByName('stage3Bg');
        stage3Bg && stage3Bg.setAnimate({
            target: {
                alpha: 0
            },
            duration: 3000,
            completeFunc: function () {
                stage3Bg.setStatus(STATUS.DESTROYED);
            }
        });

        var sPlanet1 = stage.getDisplayObjectByName('sPlanet1');
        sPlanet1.setAnimate({
            target: {
                y: -game.asset.sPlanet1.height
            },
            duration: 3000,
            completeFunc: function () {
                sPlanet1.setStatus(STATUS.DESTROYED);
            }
        });

        var bPlanet3 = stage.getDisplayObjectByName('bPlanet3');
        bPlanet3.setAnimate({
            target: {
                y: -game.asset.bPlanet3.height
            },
            duration: 6000,
            completeFunc: function () {
                bPlanet3.setStatus(STATUS.DESTROYED);
                awakeContainerNode.css('top', -awakeContainerNode.height()).css('display', 'block');
                awakeContainerNode.animate({
                    top: 50,
                }, 1500, function (e) {
                    awakeContainerNode.on('click', switchStage);
                });
            }
        });
    }

    function switchStage(e) {
        e.preventDefault();
        e.stopPropagation();
        awakeContainerNode.animate({
            opacity: 0
        }, 500);
        var canvasNode = $(game.canvas);
        game.pause();
        canvasNode.animate({
            opacity: 0,
        }, 500, function (e) {
            game.resume();
            stage.clearAllDisplayObject();
            // canvasNode.css('opacity', 0);//.css('top', originalTop);
            stage4.init({
                game: game,
                stage: stage,
                baseZIndex: baseZIndex,
                isStart: isStart
            });
            canvasNode.animate({
                opacity: 1,
            }, 500, function (e) {

            });
        });
    }

    var originalTop;

    var exports = {
        init: function (opts) {
            game = opts.game;
            stage = opts.stage;
            baseZIndex = opts.baseZIndex;
            isStart = opts.isStart;

            originalTop = $(game.canvas).css('top');

            bgControl.create();
            planetControl.create();
            starControl.create();
            earthControl.create();

            var t = setTimeout(function () {
                clearTimeout(t);
                textControl.create();
            }, 2000);

            // test
            // robot2Control.create();

            // arrowNode.on('click', switchStage);




            // var text = stage.addDisplayObject(
            //     new ig.Text({
            //         name: 'text1',
            //         content: '这是第二个场景',
            //         x: (game.width - 264) / 2,
            //         y: (game.height - 130),// * game.ratioY,
            //         size: 15,
            //         zIndex: baseZIndex,
            //         fillStyle: '#ffad26',
            //         fontFamily: 'Arial,sans-serif',
            //     })
            // );

            /*planetControl.create();
            starControl.create();

            var t = setTimeout(function () {
                clearTimeout(t);
                textControl.create();
            }, 2000);

            meteorControl.create();

            ig.loop({
                step: function (dt, stepCount, requestID) {
                    if (!isStart) {
                        window.cancelAnimationFrame(requestID);
                    }
                    meteorControl.create();
                },
                exec: function (execCount) {
                },
                jumpFrames: 120
            });

            arrowNode.on('click', function (e) {
                var canvasNode = $(game.canvas);
                game.pause();
                canvasNode.animate({
                    top: -game.height,
                }, 1500, function (e) {
                    game.resume();
                    stage.clearAllDisplayObject();
                    canvasNode.css('opacity', 0).css('top', originalTop);
                    canvasNode.animate({
                        opacity: 1,
                    }, 1500, function (e) {
                        console.warn('done');
                        var text = stage.addDisplayObject(
                            new ig.Text({
                                name: 'text1',
                                content: '这是第二个场景',
                                x: (game.width - 264) / 2,
                                y: (game.height - 130),// * game.ratioY,
                                size: 15,
                                zIndex: baseZIndex,
                                fillStyle: '#ffad26',
                                fontFamily: 'Arial,sans-serif',
                            })
                        );
                    });
                    console.warn(stage.getDisplayObjectList());
                });
            });*/

        }
    };

    return exports;

})();
