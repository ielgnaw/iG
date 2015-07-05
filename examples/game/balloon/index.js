/* global ig */

'use strict';

window.onload = function () {
    var util = ig.util;
    var STATUS = ig.getConfig('status');
    var canvas = document.querySelector('#canvas');

    var game = new ig.Game({
        canvas: canvas,
        name: 'balloon-game',
        maximize: 1,
        resource: [
            {id: 'bg', src: '/examples/img/game/balloon/bg.jpg'},
            {id: 'panel', src: '/examples/img/game/balloon/panel.png'},
            {id: 'playBut', src: '/examples/img/game/balloon/playBut.png'},
            {id: 'spriteSheetImg', src: '/examples/img/game/balloon/sprite-sheet1.png'},
            {id: 'spriteSheetData', src: './data/sprite-sheet1.json'},
            {id: 'boomImg', src: '/examples/img/game/balloon/boom.png'},
            {id: 'boomData', src: './data/boom.json'},
            {id: 'hudImg', src: '/examples/img/game/balloon/hud.png'},
        ]
    }).on('loadResProcess', function (e) {
        document.querySelector('#load-process').innerHTML
            = 'loadProcess: ' + (e.data.loadedCount / e.data.total).toFixed(1) * 100 + '%';
    }).on('loadResDone', function (e) {
        document.querySelector('#load-process').style.display = 'none';
    });

    var allData;
    var spritesData;
    var boomData;
    var gameIsStart = false;

    var gameCountDown = 10;

    // 计时
    var timeText = new ig.Text({
        name: 'scoreTime',
        content: gameCountDown,
        x: 13 * game.ratioX,
        y: 13 * game.ratioY,
        // scaleX: 0.5,
        // scaleY: 0.5,
        size: 20 * game.ratioX,
        isBold: true,
        angle: 0,
        // debug: 1,
        zIndex: 100,
        fillStyle: '#fff',
        followParent: 0
    });

    // 分数
    var scoreText = new ig.Text({
        name: 'scoreText',
        content: '00000000',
        x: 100 * game.ratioX,
        y: 8 * game.ratioY,
        // scaleX: 0.5,
        // scaleY: 0.5,
        size: 25 * game.ratioX,
        isBold: true,
        angle: 0,
        // debug: 1,
        zIndex: 100,
        fillStyle: '#fff',
        followParent: 0,
    });

    // scoreText.changeContent('00000030');

    var stage = game.createStage({
        name: 'balloon-stage',
        parallaxOpts: [
            {
                image: 'bg',
                anims: [
                    {
                        ax: 1,
                        ay: 1
                    },
                    {
                        ax: -1,
                        ay: 1
                    }
                ],
                animInterval: 1000
            }
        ],
        captureFunc: function (e) {
            stageCaptureFunc.call(this, e);
        },
        moveFunc: function (e) {
            stageMoveFunc.call(this, e);
        },
        releaseFunc: function (e) {
            stageReleaseFunc.call(this, e);
        }
    });

    var coverWidth = 326;
    var coverHeight = 320;

    var startCover = stage.addDisplayObject(
        new ig.Bitmap({
            name: 'startCover',
            image: 'panel',
            x: stage.width / 2 - coverWidth * game.ratioX / 2,
            y: -100,
            sx: 28,
            sy: 1680,
            // debug: 1,
            sWidth: coverWidth,
            sHeight: coverHeight,
            width: coverWidth * game.ratioX,
            height: coverHeight * game.ratioY,
            mouseEnable: true,
            zIndex: 1,
            startIndex: 0 // 自定义属性，用于记录点击 playBut 是否出气球开始界面
        })
    );

    var playBut = stage.addDisplayObject(
        new ig.Bitmap({
            name: 'playBut',
            image: 'playBut',
            x: -100,
            y: stage.height - 150 * game.ratioY,
            width: 108 * game.ratioX,
            height: 108 * game.ratioY,
            mouseEnable: true,
            zIndex: 1,
            // debug: 1
        })
    );

    /**
     * 初始化气球
     */
    function initBalloon() {
        // 六列
        var countInRow = 6;
        // 七行
        var countInCol = 7 + 1;
        // 每一帧的宽度
        var tileW = 64;
        // 每一帧的高度
        var tileH = 86;

        var rx = stage.width / (countInRow * tileW);
        var ry = stage.height / (countInCol * tileH);

        var index = 0;
        /* jshint loopfunc:true */
        for (var colIndex = 1; colIndex < countInCol; colIndex++) {
            for (var rowIndex = 0; rowIndex < countInRow; rowIndex++) {
                var d = spritesData[util.randomInt(0, 5)];
                // var d = spritesData[0];
                (function (_d, colI, rowI) {
                    stage.addDisplayObject(
                        new ig.SpriteSheet({
                            name: rowI + '_' + colI,
                            image: 'spriteSheetImg',
                            sheet: 'spriteSheetData',
                            sheetKey: _d.type,
                            asset: game.asset.spriteSheetImg,
                            sheetData: allData[_d.type],
                            jumpFrames: 5,
                            x: rowI * _d.data.tileW * rx + 2 * rx,
                            y: colI * _d.data.tileH * ry,
                            // debug: 1,
                            zIndex: 3,
                            scaleX: rx,
                            scaleY: ry,
                            width: 50,
                            height: 50,
                            // mouseEnable: true,
                            // 自定义属性
                            c: {
                                data: _d.data,
                                captureData: _d.captureData,
                                type: _d.type,
                                index: ++index
                            }
                        })
                    );
                })(d, colIndex, rowIndex);
            }
        }
    }

    var abs = Math.abs;
    var canBoomBalloons = [];
    var holdSpriteList = [];

    var stageCaptureSprite = null;

    /**
     * stage capture 回调事件
     *
     * @param {Object} e captureFunc 的回调参数
     */
    function stageCaptureFunc(e) {
        if (!gameIsStart) {
            return;
        }
        var displayObjectList = this.displayObjectList;
        for (var i = 0, len = displayObjectList.length; i < len; i++) {
            if (displayObjectList[i].hitTestPoint(e.x, e.y)) {
                stageCaptureSprite = displayObjectList[i];
                return;
            }
        }
    }

    /**
     * 根据条件删除数组里的满足条件的项，返回新数组
     *
     * @param {Array} list 待删除的数组
     * @param {Function} callback 条件函数，返回 true 就执行
     *
     * @return {Array} 结果数组
     */
    function removeArr(list, callback) {
        var ret = [];
        var candidateIndex = -1;
        var tmp;
        for (var i = 0, len = list.length; i < len; i++) {
            tmp = list[i];
            if (!callback(tmp)) {
                ret.push(tmp);
            }
        }
        return ret;
    }

    /**
     * stage move 回调事件
     *
     * @param {Object} e moveFunc 毁掉参数
     */
    function stageMoveFunc(e) {
        if (!gameIsStart) {
            return;
        }
        e.domEvent.preventDefault();

        holdSpriteList = e.holdSpriteList.concat();

        var firstItem;
        if (stageCaptureSprite && !e.holdSprites[stageCaptureSprite.name]) {
            firstItem = stageCaptureSprite;
            holdSpriteList.unshift(stageCaptureSprite);
        }
        else {
            firstItem = holdSpriteList[0];
        }

        if (!firstItem || firstItem.name === 'hud'
            || firstItem.name === 'scoreTime'
            || firstItem.name === 'scoreText'
            || firstItem.name.indexOf('boom_') > -1
        ) {
            return;
        }

        var balloonType = firstItem.c.type;
        holdSpriteList = removeArr(holdSpriteList, function (item) {
            return item.c.type !== balloonType;
        });

        var len = holdSpriteList.length;

        for (var i = 0, j = -1; i < len; i++, j++) {
            var cur = holdSpriteList[i];
            var prev = holdSpriteList[j] || cur;
            var sub = abs(cur.c.index - prev.c.index);
            if (sub !== 5 && sub !== 6 && sub !== 7 && sub !== 1 && sub !== 0) {
                prev.change(prev.c.data);
                util.removeArrByCondition(canBoomBalloons, function (item) {
                    return item.name === prev.name;
                });
                return;
            }
            else {
                cur.change(cur.c.captureData);
                if (!inCanBoomBalloons(cur.name)) {
                    canBoomBalloons.push(cur);
                }
            }
        }
    }

    /**
     * stage release 回调事件
     *
     * @param {Object} e releaseFunc 毁掉参数
     */
    function stageReleaseFunc(e) {
        if (!gameIsStart) {
            return;
        }
        var len = canBoomBalloons.length;
        if (len < 3) {
            for (var i = 0, len = holdSpriteList.length; i < len; i++) {
                var sprite = holdSpriteList[i];
                if (sprite.name !== 'hud' && sprite.name !== 'scoreText' && sprite.name !== 'scoreTime') {
                    sprite.change(util.extend({}, sprite.c.data));
                }
            }
        }
        else {
            var isChangeStageParallax = false;
            stage.setParallax({
                image: 'bg',
                ay: 5
            });
            while (canBoomBalloons.length) {
                var curBoomBalloon = canBoomBalloons.shift();
                curBoomBalloon.setStatus(STATUS.DESTROYED);

                var score = scoreText.getContent();
                score = parseInt(score, 10) + 10 + '';
                if (score.length < 8) {
                    var tmp = '';
                    for (var i = 0; i < 8 - score.length; i++) {
                        tmp += '0';
                    }
                    score = tmp + score;
                }
                scoreText.changeContent(score);
                scoreText.setAnimate({
                    target: {
                        angle: 360
                    },
                    duration: 500,
                    completeFunc: function (e) {
                        e.data.source.angle = 0;
                    }
                });

                var boomSprite = createBoomSprite(
                    curBoomBalloon.x - boomData.tileW / 2 * game.ratioX + 10,
                    curBoomBalloon.y - boomData.tileH / 2 * game.ratioY + 10,
                    {
                        boomBalloon: curBoomBalloon
                    },
                    function () {
                        var d = spritesData[util.randomInt(0, 5)];
                        var newBalloon = stage.addDisplayObject(
                            new ig.SpriteSheet({
                                name: this.c.boomBalloon.name,
                                asset: game.asset.spriteSheetImg,
                                sheetData: allData[d.type],
                                jumpFrames: 5,
                                x: this.c.boomBalloon.x,
                                y: this.c.boomBalloon.y,
                                // debug: 1,
                                zIndex: 2,
                                scaleX: 0.1, // this.c.boomBalloon.scaleX,
                                scaleY: 0.1, // this.c.boomBalloon.scaleY,
                                // width: this.c.boomBalloon.width,
                                // height: this.c.boomBalloon.height,
                                // 自定义属性
                                c: {
                                    data: d.data,
                                    captureData: d.captureData,
                                    type: d.type,
                                    index: this.c.boomBalloon.c.index
                                }
                            })
                        );

                        newBalloon.setAnimate({
                            target: {
                                scaleX: this.c.boomBalloon.scaleX,
                                scaleY: this.c.boomBalloon.scaleY
                            },
                            duration: 1000,
                            completeFunc: function () {
                                if (!isChangeStageParallax) {
                                    isChangeStageParallax = true;
                                    stage.setParallax({
                                        image: 'bg'
                                    });
                                }
                            }
                        });
                    }
                );
            }
        }
        holdSpriteList = [];
        stageCaptureSprite = null;
        canBoomBalloons = [];
    }

    /**
     * 判断 spritesheet 是否在 canBoomBalloons 里
     *
     * @param {string} displayObjectName spritesheet name
     *
     * @return {boolean} 结果
     */
    function inCanBoomBalloons(displayObjectName) {
        for (var i = 0, len = canBoomBalloons.length; i < len; i++) {
            if (canBoomBalloons[i].name === displayObjectName) {
                return true;
            }
        }
        return false;
    }

    var boomGuid = 0;
    function createBoomSprite(x, y, c, callback) {
        return stage.addDisplayObject(
            new ig.SpriteSheet({
                name: 'boom_' + boomGuid++,
                asset: game.asset.boomImg,
                sheetData: boomData,
                jumpFrames: 2,
                x: x,
                y: y,
                // debug: 1,
                zIndex: 10,
                scaleX: game.ratioX,
                scaleY: game.ratioY,
                isOnce: true,
                onceDone: callback || util.noop,
                c: c || {}
            })
        );
    }

    function initHud() {
        var rx = stage.width / game.asset.hudImg.width;
        var ry = stage.height / game.asset.hudImg.height;
        var hud = stage.addDisplayObject(
            new ig.Bitmap({
                name: 'hud',
                asset: game.asset.hudImg,
                x: 0,
                y: 0,
                width: game.asset.hudImg.width * game.ratioX, // * rx,
                // height: game.asset.hudImg.height * ry,
                height: game.asset.hudImg.height * game.ratioY, // * ry,
                // width: 108 * game.ratioX,
                // height: 108 * game.ratioY,
                zIndex: 0,
                // debug: 1
                children: [timeText, scoreText]
            })
        );
    }

    game.start(function () {

        boomData = game.asset.boomData;
        allData = game.asset.spriteSheetData;
        spritesData = [
            {type:'red', data: allData.red, captureData: allData.redCapture},
            {type:'orange', data: allData.orange, captureData: allData.orangeCapture},
            {type:'yellow', data: allData.yellow, captureData: allData.yellowCapture},
            {type:'green', data: allData.green, captureData: allData.greenCapture},
            {type:'blue', data: allData.blue, captureData: allData.blueCapture},
            {type:'pink', data: allData.pink, captureData: allData.pinkCapture}
        ];


        startCover.setStatus(STATUS.DESTROYED);
        stage.addDisplayObject(
            new ig.Bitmap({
                name: 'endCover',
                asset: game.asset.panel,
                x: stage.width / 2 - coverWidth * game.ratioX / 2,
                y: 100,
                sx: 412,
                sy: 1175,
                // debug: 1,
                sWidth: coverWidth,
                sHeight: coverHeight,
                width: coverWidth * game.ratioX,
                height: coverHeight * game.ratioY,
                mouseEnable: true,
                zIndex: 1,
                children: [
                    new ig.Text({
                        name: 'scoreResult',
                        content: '00000000',
                        x: 44 * game.ratioX,
                        y: 96 * game.ratioY,
                        size: 40 * game.ratioX,
                        isBold: true,
                        angle: 0,
                        zIndex: 100,
                        fillStyle: '#fff',
                        followParent: 0
                    }),
                    new ig.Text({
                        name: 'zuichangliantiao',
                        content: '00000000',
                        x: 134 * game.ratioX,
                        y: 171 * game.ratioY,
                        size: 25 * game.ratioX,
                        isBold: true,
                        angle: 0,
                        zIndex: 100,
                        fillStyle: '#fff',
                        followParent: 0
                    }),
                    new ig.Text({
                        name: 'baopoqiqiu',
                        content: '00000000',
                        x: 134 * game.ratioX,
                        y: 201 * game.ratioY,
                        // scaleX: 0.5,
                        // scaleY: 0.5,
                        size: 25 * game.ratioX,
                        isBold: true,
                        angle: 0,
                        zIndex: 100,
                        fillStyle: '#fff',
                        followParent: 0
                    }),
                    new ig.Text({
                        name: 'maxScore',
                        content: '00000000',
                        x: 134 * game.ratioX,
                        y: 255 * game.ratioY,
                        // scaleX: 0.5,
                        // scaleY: 0.5,
                        size: 25 * game.ratioX,
                        isBold: true,
                        angle: 0,
                        zIndex: 100,
                        fillStyle: '#fff',
                        followParent: 0
                    }),
                ]
            })
        );
        return;

        // setTimeout(function () {
        //     game.pause();
        //     setTimeout(function () {
        //         game.resume();
        //     }, 3000);
        // }, 3000);

        startCover.setAnimate({
            target: {
                y: stage.height / 2 - coverHeight * game.ratioY / 2 - 100 * game.ratioY
            },
            tween: ig.easing.easeOutBounce
        });
        playBut.setAnimate({
            target: {
                x: stage.width / 2 - 108 * game.ratioX / 2
            },
            tween: ig.easing.easeOutBounce,
            duration: 1500,
            completeFunc: function (e) {
                e.data.source.setAnimate({
                    range: {
                        y: 10
                    },
                    duration: 1500,
                    repeat: 1
                }).setCaptureFunc(function (e) {
                    e.domEvent.preventDefault();
                    if (startCover.startIndex === 0) {
                        startCover.startIndex = 1;
                        var tmpX = startCover.x;
                        startCover.setAnimate({
                            target: {
                                x: -500
                            },
                            duration: 200,
                            completeFunc: function (e) {
                                e.data.source.change({
                                    sy: 78,
                                    x: stage.width + 100
                                }).setAnimate({
                                    target: {
                                        x: tmpX
                                    },
                                    duration: 1000,
                                    tween: ig.easing.easeOutBounce
                                });
                            }
                        });
                    }
                    else {
                        initHud();
                        initBalloon();
                        playBut.setStatus(STATUS.DESTROYED);
                        startCover.setStatus(STATUS.DESTROYED);
                        stage.setParallax({
                            image: 'bg'
                        });

                        gameIsStart = true;
                        var gameTimer = setInterval(function () {
                            if (gameCountDown.length < 2) {
                                gameCountDown = '0' + gameCountDown;
                            }
                            timeText.changeContent(gameCountDown);
                            if (gameCountDown == 0) {
                                timeText.changeContent('00');
                                clearInterval(gameTimer);
                                gameIsStart = false;
                                setTimeout(function () {
                                    game.stop();
                                }, 100);
                            }
                            gameCountDown = (gameCountDown - 1).toFixed(0);
                        }, 1000);
                    }
                });
            }
        });
    });
    // .on('gameFPS', function (e) {
    //     document.querySelector('#fps').innerHTML = 'fps: ' + e.data.fps;
    // });

};

