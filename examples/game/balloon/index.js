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
        ]
    }).on('loadResProcess', function (e) {
        document.querySelector('#load-process').innerHTML
            = 'loadProcess: ' + (e.data.loadedCount / e.data.total).toFixed(1) * 100 + '%';
    }).on('loadResDone', function (e) {
        document.querySelector('#load-process').style.display = 'none';
    });

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
        moveFunc: function (e) {
            e.domEvent.preventDefault();
        },
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
        var allData = game.asset.spriteSheetData;
        var spritesData = [
            {
                type:'red',
                data: allData.red,
                captureData: allData.redCapture
            },
            {
                type:'orange',
                data: allData.orange,
                captureData: allData.orangeCapture
            },
            {
                type:'yellow',
                data: allData.yellow,
                captureData: allData.yellowCapture
            },
            {
                type:'green',
                data: allData.green,
                captureData: allData.greenCapture
            },
            {
                type:'blue',
                data: allData.blue,
                captureData: allData.blueCapture
            },
            {
                type:'pink',
                data: allData.pink,
                captureData: allData.pinkCapture
            }
        ];

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
        console.warn(game.ratioX , rx);
        console.warn(game);
        /* jshint loopfunc:true */
        for (var rowIndex = 0; rowIndex < countInRow; rowIndex++) {
            for (var colIndex = 1; colIndex < countInCol; colIndex++) {
                var d = spritesData[util.randomInt(0, 5)];
                (function (_d) {
                    stage.addDisplayObject(
                        new ig.SpriteSheet({
                            name: colIndex + '_' + rowIndex,
                            image: 'spriteSheetImg',
                            sheet: 'spriteSheetData',
                            sheetKey: _d.type,
                            asset: game.asset.spriteSheetImg,
                            sheetData: allData[_d.type],
                            jumpFrames: 5,
                            x: rowIndex * _d.data.tileW * rx + 0 * game.ratioX,
                            y: colIndex * _d.data.tileH * ry,
                            debug: 1,
                            zIndex: 2,
                            scaleX: rx,
                            scaleY: ry,
                            width: 50,
                            height: 50,
                            // 自定义属性
                            c: {
                                data: _d.data,
                                captureData: _d.captureData,
                                type: _d.type,
                                index: ++index
                            },
                            captureFunc: function (e) {
                                captureFunc.call(this, e, _d);
                            },
                            moveFunc: function (e) {
                                moveFunc.call(this, e);
                            },
                            releaseFunc: function (e) {
                                releaseFunc.call(this, e, _d);
                            },
                            // useCache: false
                        })
                    );
                })(d);
            }
        }
    }

    var abs = Math.abs;
    var canBoomBalloons = [];

    /**
     * 每个气球获取焦点的事件回调
     * 上下文是当前获取焦点的气球的这个 SpriteSheet 实例
     *
     * @param {Object} e captureFunc 的回调参数
     * @param {Object} spriteData 当前这个 SpriteSheet 实例对应的 sprite 数据
     */
    function captureFunc(e, spriteData) {
        // this.change(util.extend({}, spriteData.captureData));
    }

    var holdSprites = [];

    function moveFunc(e) {
        // this 是开始的那一个
        this.change(util.extend({}, this.c.captureData));
        for (var i = 0, len = e.holdSprites.length; i < len; i++) {
            var sprite = e.holdSprites[i];
            sprite.change(util.extend({}, sprite.c.captureData));
        }


        // holdSprites = e.holdSprites;
        // var first = holdSprites[0];
        // util.removeArrByCondition(holdSprites, function (item) {
        //     return item.c.type !== first.c.type;
        // });

        // var len = holdSprites.length;

        // for (var i = 0, j = -1; i < len; i++, j++) {
        //     var cur = holdSprites[i];
        //     var prev = holdSprites[j] || cur;
        //     var sub = abs(cur.c.index - prev.c.index);
        //     if (sub !== 5 && sub !== 6 && sub !== 7 && sub !== 1 && sub !== 0) {
        //         prev.change(prev.c.data);
        //         util.removeArrByCondition(canBoomBalloons, function (item) {
        //             return item.name !== prev.name;
        //         });
        //         return;
        //     }
        //     else {
        //         cur.change(cur.c.captureData);
        //         if (!inCanBoomBalloons(cur.name)) {
        //             canBoomBalloons.push(cur);
        //         }
        //     }
        // }
    }

    function releaseFunc(e, d) {
        holdSprites = [];
        // this.change(d.data);
        // var len = canBoomBalloons.length;
        // if (len >= 3) {
        //     // var content = parseInt(gameScoreText.getContent(), 10);
        //     // gameScoreText.changeContent(content + canBoomBalloons.length * 100);
        //     while (canBoomBalloons.length) {
        //         var curBoomBalloon = canBoomBalloons.shift();
        //         curBoomBalloon.setStatus(STATUS.DESTROYED);
        //         // var boomSprite = createBoomSprite(
        //         //     curBoomBalloon.x - boomData.tileW / 2 * ratioX + 10,
        //         //     curBoomBalloon.y - boomData.tileH / 2 * ratioY + 10,
        //         //     {
        //         //         boomBalloon: curBoomBalloon
        //         //     },
        //         //     boomSpriteOnceDone
        //         // );
        //         // stage.addDisplayObject(boomSprite);
        //         // boomSpriteOnceDone(boomSprite);
        //     }
        // }
        // canBoomBalloons = [];
    }

    function inCanBoomBalloons(displayObjectName) {
        for (var i = 0, len = canBoomBalloons.length; i < len; i++) {
            if (canBoomBalloons[i].name === displayObjectName) {
                return true;
            }
        }
        return false;
    }

    game.start(function () {
        initBalloon();
        playBut.setStatus(STATUS.DESTROYED);
        startCover.setStatus(STATUS.DESTROYED);
        return;
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
                        initBalloon();
                        playBut.setStatus(STATUS.DESTROYED);
                        startCover.setStatus(STATUS.DESTROYED);
                    }
                });
            }
        });
    });
    // .on('gameFPS', function (e) {
    //     document.querySelector('#fps').innerHTML = 'fps: ' + e.data.fps;
    // });

};

