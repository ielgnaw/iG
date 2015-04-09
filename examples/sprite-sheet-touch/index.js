/* global ig */
window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');
    var util = ig.util;

    var game = new ig.Game({
        fps: 30,
        name: 'game1'
    });

    game.init({
        canvas: canvas,
        maximize: true,
        scaleFit: true
    });

    ig.loadResource(
        [
            {
                id: 'bg',
                src: '../img/bg.jpg'
            },
            {
                id: 'ss3',
                src: '../img/sprite-sheet3.png'
            },
            {
                id: 'spritesData',
                src: './data/sprite-sheet3.json'
            },
            {
                id: 'boom',
                src: '../img/boom.png'
            },
            {
                id: 'boomData',
                src: './data/boom.json'
            }
        ],
        function (resource) {
            var stage = game.createStage({
                name: 'bg'
            }).setParallaxScroll({
                image: resource.bg,
                anims: [
                    {
                        aX: 1,
                        aY: 1
                    },
                    {
                        aX: -1,
                        aY: 1
                    }
                ],
                animInterval: 1000 // 切换 parallax 的间隔，这里指的是帧数间隔
            });

            var allData = resource.spritesData;

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

            var boomData = resource.boomData.boom;

            // 场景的宽度
            var width = stage.width;

            // 场景的高度
            var height = stage.height;

            // 六列
            var countInRow = 6;

            // 七行
            var countInCol = 7 + 1;

            var ratioX = width / (countInRow * 64);
            var ratioY = height / (countInCol * 86);

            var guid = 0;
            function createBoomSprite(x, y, c, callback) {
                return new ig.SpriteSheet({
                    x: x,
                    y: y,
                    name: 'boom' + (guid++),
                    image: resource.boom,
                    sX: boomData.sX,
                    sY: boomData.sY,
                    total: boomData.total,
                    tileW: boomData.tileW,
                    tileH: boomData.tileH,
                    cols: boomData.cols,
                    rows: boomData.rows,
                    offsetX: boomData.offsetX,
                    offsetY: boomData.offsetY,
                    zIndex: 10,
                    ticksPerFrame: 2,
                    scaleX: ratioX,
                    scaleY: ratioY,
                    isOnce: true,
                    onceDone: callback || util.noop,
                    c: c || {}
                    // debug: 1
                });
            }

            var index = 0;

            for (var colIndex = 1; colIndex < countInCol; colIndex++) {
                for (var rowIndex = 0; rowIndex < countInRow; rowIndex++) {
                    var d = spritesData[util.randomInt(0, 5)];
                    (function (_d) {
                        var balloonSprite = new ig.SpriteSheet({
                            name: rowIndex + '_' + colIndex,
                            image: resource.ss3,
                            x: rowIndex * _d.data.tileW * ratioX,
                            y: colIndex * _d.data.tileH * ratioY,
                            // 用 points 更精确捕捉 touch 事件
                            points: [
                                {
                                    x: 5,
                                    y: 10
                                },
                                {
                                    x: _d.data.tileW - 5,
                                    y: 10
                                },
                                {
                                    x: 45,
                                    y: _d.data.tileH - 20
                                },
                                {
                                    x: _d.data.tileW - 45,
                                    y: _d.data.tileH - 20
                                }
                            ],
                            sX: _d.data.sX,
                            sY: _d.data.sY,
                            total: _d.data.total,
                            tileW: _d.data.tileW,
                            tileH: _d.data.tileH,
                            cols: _d.data.cols,
                            rows: _d.data.rows,
                            zIndex: 1,
                            ticksPerFrame: 2,
                            scaleX: ratioX,
                            scaleY: ratioY,
                            // debug: 1,
                            mouseEnable: true,
                            c: {
                                data: _d.data,
                                captureData: _d.captureData,
                                type: _d.type,
                                index: ++index
                            },
                            captureFunc: function (e) {
                                captureFunc.call(this, e);
                            },
                            releaseFunc: function (e) {
                                releaseFunc.call(this, e, _d);
                            },
                            moveFunc: function (e) {
                                moveFunc.call(this, e);
                            }
                        });
                        stage.addDisplayObject(balloonSprite);
                    })(d);
                }
            }

            var abs = Math.abs;
            var canBoomBalloons = [];

            function inCanBoomBalloons(displayObjectName) {
                for (var i = 0, len = canBoomBalloons.length; i < len; i++) {
                    if (canBoomBalloons[i].name === displayObjectName) {
                        return true;
                    }
                }
                return false;
            }

            function captureFunc(e) {
                this.changeFrame(util.extend({}, this.c.captureData, {ticksPerFrame: 1}));
            }

            var holdSprites;

            function moveFunc(e) {
                holdSprites = e.holdSprites;
                var first = holdSprites[0];
                util.removeArrByCondition(holdSprites, function (item) {
                    return item.c.type !== first.c.type;
                });

                var len = holdSprites.length;

                for (var i = 0, j = -1; i < len; i++, j++) {
                    var cur = holdSprites[i];
                    var prev = holdSprites[j] || cur;
                    var sub = abs(cur.c.index - prev.c.index);
                    if (sub !== 5 && sub !== 6 && sub !== 7 && sub !== 1 && sub !== 0) {
                        prev.changeFrame(prev.c.data);
                        return;
                    }
                    else {
                        cur.changeFrame(cur.c.captureData);
                        if (!inCanBoomBalloons(cur.name)) {
                            canBoomBalloons.push(cur);
                        }
                    }
                }
            }

            function releaseFunc(e, d) {
                holdSprites = [];
                this.changeFrame(d.data);
                var len = canBoomBalloons.length;
                if (len >= 3) {
                    // for (var i = 0; i < len; i++) {
                    //     var curBoomBalloon = canBoomBalloons[i];
                    //     curBoomBalloon.changeStatus(5);
                    //     stage.addDisplayObject(
                    //         createBoomSprite(
                    //             curBoomBalloon.x - boomData.tileW / 2 * ratioX + 10,
                    //             curBoomBalloon.y - boomData.tileH / 2 * ratioY + 10,
                    //             {
                    //                 boomBalloon: curBoomBalloon
                    //             },
                    //             boomSpriteOnceDone
                    //         )
                    //     );
                    // }
                    while (canBoomBalloons.length) {
                        var curBoomBalloon = canBoomBalloons.shift();
                        curBoomBalloon.changeStatus(5);
                        var boomSprite = createBoomSprite(
                            curBoomBalloon.x - boomData.tileW / 2 * ratioX + 10,
                            curBoomBalloon.y - boomData.tileH / 2 * ratioY + 10,
                            {
                                boomBalloon: curBoomBalloon
                            }
                        );
                        stage.addDisplayObject(boomSprite);
                        boomSpriteOnceDone(boomSprite);
                    }
                }
            }

            var tmp = [];

            function boomSpriteOnceDone(boomSprite) {
                tmp.push(boomSprite.c.boomBalloon);
                if (!canBoomBalloons.length) {
                    for (var i = 0, j = 1, len = tmp.length; i < len; i++, j++) {
                        var cur = tmp[i];
                        var col = parseInt(cur.name.split('_')[0], 10);
                        var row = parseInt(cur.name.split('_')[1], 10);
                        for (; col <= 5; col++) {
                            var testSprite = stage.getDisplayObjectByName(col + '_' + row);
                            var am = new ig.Animation({
                                fps: 30,
                                source: testSprite
                                , duration: 1000
                                , target: {
                                    x: testSprite.x - testSprite.tileW * ratioX
                                }
                            }).play();
                        }
                        console.warn(cur, col);
                        // var prev = tmp[i];
                        // var next = tmp[j];
                        // if (next) {
                        //     console.warn(prev.c.index, next.c.index);
                        //     if (prev.c.index % 6 !== 0 && next.c.index % 6 !== 0) {

                        //     }
                        // }
                    }
                    // tmp = [];
                    // console.warn(11);
                }

                // var testSprite = stage.getDisplayObjectByName('balloon_4_1');
                // var am = new ig.Animation({
                //     fps: 50,
                //     source: testSprite
                //     , duration: 1000
                //     , target: {
                //         x: testSprite.x - testSprite.tileW * ratioX
                //     }
                // }).play();
            }

            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            });
        }
    );
};
