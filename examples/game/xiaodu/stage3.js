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

    var arrowNode = $('.arrow-container span');

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

        function createStage2Bg() {
            var asset = game.asset.stage2Bg;
            var stage2Bg = stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'stage2Bg',
                    asset: asset,
                    x: (game.width - asset.width) / 2, // 265 * game.ratioX,
                    y: (game.height - asset.height) / 2, // 50 * game.ratioY,
                    zIndex: baseZIndex - 1,
                })
            );
        }

        var exports = {};

        exports.create = function () {
            createStage2Bg();
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
                    x: 320 * game.ratioX,
                    y: 100 * game.ratioY,
                    zIndex: baseZIndex
                })
            );

            star1.setAnimate({
                range: {
                    scaleX: 0.3,
                    scaleY: 0.3,
                    alpha: 1,
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
                    x: 65 * game.ratioX,
                    y: 50 * game.ratioY,
                    zIndex: baseZIndex
                })
            );

            star2.setAnimate({
                range: {
                    scaleX: 0.3,
                    scaleY: 0.3,
                    alpha: 1,
                },
                repeat: 1,
                duration: 1000
            });
        }

        var exports = {};

        exports.create = function () {
            createStar1();
            var t = setTimeout(function () {
                clearTimeout(t);
                createStar2();
            }, 500);
        };

        return exports;
    })();

    /**
     * 漩涡模块
     *
     * @return {Object} 模块暴露的接口
     */
    var eddyControl = (function () {

        // 旋转的速率
        var rotateSpeed = 0.02;

        function createEddyInline() {
            var direction = 1;
            var asset = game.asset.eddy1;
            var eddy1 = stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'eddy1',
                    asset: asset,
                    x: (game.width - asset.width) / 2, // 265 * game.ratioX,
                    y: (game.height - asset.height) / 2 - 70, // 50 * game.ratioY,
                    zIndex: baseZIndex - 1,
                })
            );

            eddy1.step = function (dt, stepCount, requestID) {
                if (direction) {
                    this.angle += rotateSpeed;
                }
                else {
                    this.angle -= rotateSpeed;
                }

                if (this.angle.toFixed() === '15') {
                    direction = 0;
                }
                else if (this.angle.toFixed() === '-15') {
                    direction = 1;
                }
            };

            return eddy1;
        }

        function createEddyOutline() {
            var direction = 0;
            var asset = game.asset.eddy2;
            var eddy2 = stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'eddy2',
                    asset: asset,
                    x: (game.width - asset.width) / 2, // 265 * game.ratioX,
                    y: (game.height - asset.height) / 2 - 70, // 50 * game.ratioY,
                    zIndex: baseZIndex - 1,
                })
            );

            eddy2.step = function (dt, stepCount, requestID) {
                if (direction) {
                    this.angle += rotateSpeed;
                }
                else {
                    this.angle -= rotateSpeed;
                }

                if (this.angle.toFixed() === '10') {
                    direction = 0;
                }
                else if (this.angle.toFixed() === '-10') {
                    direction = 1;
                }
            };
        }

        var exports = {};

        exports.create = function () {
            var ed = createEddyInline();
            createEddyOutline();
            return ed;
        };

        return exports;
    })();

    /**
     * 机器人模块
     *
     * @return {Object} 模块暴露的接口
     */
    var robotControl = (function () {
        function createRobot() {
            var asset = game.asset.robot;

            var _robot = stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'robot',
                    asset: game.asset.robot,
                    x: (game.width - asset.width) / 2,
                    y: game.height,
                    zIndex: baseZIndex
                })
            );

            _robot.setAnimate({
                target: {
                    y: game.height - asset.height - 40,
                },
                duration: 1500,
                tween: ig.easing.easeOutBounce,
                completeFunc: function (e) {
                    arrowNode.parent().css('display', 'block');
                    robot.setAnimate({
                        range: {
                            y: 10,
                        },
                        duration: 2000,
                        repeat: 1
                    });
                }
            });
            return _robot;
        }

        var exports = {};

        exports.create = function () {
            return createRobot();
        };

        return exports;
    })();

    function switchStage(e) {
        arrowNode.off('click', switchStage);
        arrowNode.parent().css('display', 'none');
        robot.animate.destroy();
        robot.setAnimate({
            target: {
                y: inlineEddy.cy - 70,
                scaleX: 0.3,
                scaleY: 0.3,
                alpha: 0
            },
            duration: 1500,
            completeFunc: function (e) {
                console.warn(1);
            }
        });

        var canvasNode = $(game.canvas);
        game.pause();
        canvasNode.animate({
            top: -game.height,
        }, 1500, function (e) {
            game.resume();
            stage.clearAllDisplayObject();
            canvasNode.css('opacity', 0).css('top', originalTop);
            stage3.init({
                game: game,
                stage: stage,
                baseZIndex: baseZIndex,
                isStart: isStart
            });
            canvasNode.animate({
                opacity: 1,
            }, 1500, function (e) {

            });
        });
    }

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
                        content: '来自智能星球的小度对宇',
                        x: (game.width - 264) / 2,
                        y: (game.height - 130),// * game.ratioY,
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
                                content: '宙充满好奇，独自进行了',
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
                                content: '一次时空穿梭之旅',
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

                robot = robotControl.create();
                return;

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
                                    robot = robotControl.create();
                                }
                            });
                        }, 2000);
                    }
                });
            }
        };
        return exports;
    })();

    var originalTop;

    var exports = {
        init: function (opts) {
            game = opts.game;
            stage = opts.stage;
            baseZIndex = opts.baseZIndex;
            isStart = opts.isStart;

            originalTop = $(game.canvas).css('top');

            var text = stage.addDisplayObject(
                new ig.Text({
                    name: 'text1',
                    content: '这是第三个场景',
                    x: (game.width - 264) / 2,
                    y: (game.height - 130),// * game.ratioY,
                    size: 15,
                    zIndex: baseZIndex,
                    fillStyle: '#ffad26',
                    fontFamily: 'Arial,sans-serif',
                })
            );

            // bgControl.create();
            // starControl.create();
            // inlineEddy = eddyControl.create();

            // var t = setTimeout(function () {
            //     clearTimeout(t);
            //     textControl.create();
            // }, 2000);

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
