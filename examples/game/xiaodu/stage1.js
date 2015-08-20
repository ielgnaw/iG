/**
 * @file 第一个场景
 * @author ielgnaw(wuji0223@gmail.com)
 */

/* global ig */

'use strict';

var stage1 = (function () {
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

    /**
     * 彗星模块
     *
     * @return {Object} 模块暴露的接口
     */
    var meteorControl = (function () {

        /**
         * 彗星运动速度，横向速度是纵向速度的两倍
         *
         * @type {Array.<Object>}
         */
        var meteorSpeeds = [
            {vx: 7, vy: 3.5},
            {vx: 8, vy: 4},
            {vx: 9, vy: 4.5},
            {vx: 10, vy: 5},
            {vx: 11, vy: 5.5},
            {vx: 12, vy: 6},
            {vx: 13, vy: 6.5}
        ];

        var guid = 0;

        function createMeteor(opts) {
            var alpha = '0.' + randomInt(2, 8);
            var meteorSpeed = meteorSpeeds[util.randomInt(0, meteorSpeeds.length - 1)];
            var conf = $.extend(true, {
                name: 'meteor' + (guid++),
                asset: game.asset.meteor1,
                x: -game.asset.meteor1.width,
                y: randomInt(-game.asset.meteor1.height, game.height - 100),
                zIndex: baseZIndex - 9,
                alpha: alpha,
                vx: meteorSpeed.vx,
                vy: meteorSpeed.vy
            }, opts);

            var meteor = stage.addDisplayObject(
                new ig.Bitmap(conf)
            );

            meteor.step = function (dt, stepCount, requestID) {
                this.vx += this.ax * dt;
                this.vx *= this.frictionX * dt;
                this.vy += this.ay * dt;
                this.vy *= this.frictionY * dt;

                this.x += this.vx * dt;
                this.y += this.vy * dt;

                if (this.x > game.width) {
                    this.vx = -Math.abs(this.vx);
                    this.setStatus(STATUS.DESTROYED);
                }
            };
        }

        var exports = {};

        exports.create = function () {
            var index = randomInt(1, 2);
            var asset = game.asset['meteor' + index];
            createMeteor({
                asset: asset,
                x: -asset.width,
                y: randomInt(-asset.height, game.height - 100),
            });
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
                    name: 'planet1',
                    asset: game.asset.planet1,
                    x: 50 * game.ratioX,
                    y: 270 * game.ratioY,
                    zIndex: baseZIndex
                })
            );
        }

        function createPlanet2() {
            stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'planet2',
                    asset: game.asset.planet2,
                    x: 265 * game.ratioX,
                    y: 170 * game.ratioY,
                    zIndex: baseZIndex
                })
            );
        }

        function createPlanet3() {
            stage.addDisplayObject(
                new ig.Bitmap({
                    name: 'planet3',
                    asset: game.asset.planet3,
                    x: 100 * game.ratioX,
                    y: 70 * game.ratioY,
                    zIndex: baseZIndex
                })
            );
        }

        var exports = {};

        exports.create = function () {
            createPlanet1();
            createPlanet2();
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
                    x: 80 * game.ratioX,
                    y: 230 * game.ratioY,
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
                    x: 265 * game.ratioX,
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
                        content: '浩 瀚 的 宇 宙 星 空，总 有 着',
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
                                content: '不 同 寻 常 的 事 情 发 生…',
                                x: 7,
                                y: 30,
                                size: 15,
                                zIndex: baseZIndex,
                                alpha: 0,
                                fillStyle: '#ffad26',
                                useCache: false,
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
                        arrowNode.parent().css('display', 'block');
                    }
                });
            }
        };
        return exports;
    })();

    function switchStage(e) {
        arrowNode.off('click', switchStage);
        arrowNode.parent().css('display', 'none');
        exports.dispose();
        var canvasNode = $(game.canvas);
        game.pause();
        canvasNode.animate({
            top: -game.height,
        }, 1500, function (e) {
            game.resume();
            stage.clearAllDisplayObject();
            canvasNode.css('opacity', 0).css('top', originalTop);
            stage2.init({
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


    var originalTop;

    var stage1End = false;

    var exports = {
        init: function (opts) {
            game = opts.game;
            stage = opts.stage;
            baseZIndex = opts.baseZIndex;
            isStart = opts.isStart;

            originalTop = $(game.canvas).css('top');

            planetControl.create();
            starControl.create();

            var t = setTimeout(function () {
                clearTimeout(t);
                textControl.create();
            }, 2000);

            meteorControl.create();

            ig.loop({
                step: function (dt, stepCount, requestID) {
                    if (!isStart || stage1End) {
                        window.cancelAnimationFrame(requestID);
                    }
                    meteorControl.create();
                },
                exec: function (execCount) {
                },
                jumpFrames: 120
            });

            arrowNode.on('click', switchStage);
        },

        dispose: function () {
            stage1End = true;
        }
    };

    return exports;

})();
