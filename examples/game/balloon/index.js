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
        moveFunc: function (d) {
            d.domEvent.preventDefault();
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

        var rX = stage.width / (countInRow * tileW);// * game.ratioX;
        var rY = stage.height / (countInCol * tileH);// * game.ratioY;
        console.warn(game.ratioX, game.ratioY, rX, rY);

        /* jshint loopfunc:true */
        for (var colIndex = 1; colIndex < countInCol; colIndex++) {
            for (var rowIndex = 0; rowIndex < countInRow; rowIndex++) {
                var d = spritesData[util.randomInt(0, 5)];
                (function (_d) {
                    var s = stage.addDisplayObject(
                        new ig.SpriteSheet({
                            name: rowIndex + '_' + colIndex,
                            image: 'spriteSheetImg',
                            sheet: 'spriteSheetData',
                            sheetKey: _d.type,
                            asset: game.asset.spriteSheetImg,
                            sheetData: allData[_d.type],
                            jumpFrames: 5,
                            x: rowIndex * _d.data.tileW * rX,
                            y: colIndex * _d.data.tileH * rY,
                            debug: 1,
                            zIndex: 2,
                            scaleX: rX,
                            scaleY: rY,
                            width: 50,
                            height: 50,
                            moveFunc: function (d) {
                                d.domEvent.preventDefault();
                                this.move(d.x, d.y);
                            },
                            // useCache: false
                        })
                    );
                    s.step = function () {
                        // this.angle++;
                    }

                    // var balloonSprite = new ig.SpriteSheet({
                    //     name: rowIndex + '_' + colIndex,
                    //     image: resource.ss3,
                    //     x: rowIndex * _d.data.tileW * ratioX,
                    //     y: colIndex * _d.data.tileH * ratioY,
                    //     // 用 points 更精确捕捉 touch 事件
                    //     points: [
                    //         {
                    //             x: 5,
                    //             y: 10
                    //         },
                    //         {
                    //             x: _d.data.tileW - 5,
                    //             y: 10
                    //         },
                    //         {
                    //             x: 45,
                    //             y: _d.data.tileH - 20
                    //         },
                    //         {
                    //             x: _d.data.tileW - 45,
                    //             y: _d.data.tileH - 20
                    //         }
                    //     ],
                    //     sX: _d.data.sX,
                    //     sY: _d.data.sY,
                    //     total: _d.data.total,
                    //     tileW: _d.data.tileW,
                    //     tileH: _d.data.tileH,
                    //     cols: _d.data.cols,
                    //     rows: _d.data.rows,
                    //     zIndex: 2,
                    //     ticksPerFrame: 1,
                    //     scaleX: ratioX,
                    //     scaleY: ratioY,
                    //     // debug: 1,
                    //     mouseEnable: true,
                    //     c: {
                    //         data: _d.data,
                    //         captureData: _d.captureData,
                    //         type: _d.type,
                    //         index: ++index
                    //     },
                    //     captureFunc: function (e) {
                    //         captureFunc.call(this, e);
                    //     },
                    //     releaseFunc: function (e) {
                    //         releaseFunc.call(this, e, _d);
                    //     },
                    //     moveFunc: function (e) {
                    //         moveFunc.call(this, e);
                    //     }
                    // });
                    // stage.addDisplayObject(balloonSprite);
                })(d);
            }
        }
        console.warn(stage);
    }

    game.start(function () {
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
                        startCover.setAnimate({
                            target: {
                                alpha: 0
                            },
                            duration: 500,
                            completeFunc: function (e) {
                                var tmpX = startCover.x;
                                e.data.source.change({
                                    sy: 78,
                                    x: stage.width + 100
                                }).setAnimate({
                                    target: {
                                        alpha: 1,
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

