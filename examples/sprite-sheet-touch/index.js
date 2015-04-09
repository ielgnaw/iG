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
            function createBoomSprite(x, y) {
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
                    isOnce: true
                    // debug: 1
                });
            }

            var index = 0;

            for (var colIndex = 1; colIndex < countInCol; colIndex++) {
                for (var rowIndex = 0; rowIndex < countInRow; rowIndex++) {
                    var d = spritesData[util.randomInt(0, 5)];
                    (function (_d) {
                        var balloonSprite = new ig.SpriteSheet({
                            name: 'balloon_' + rowIndex + '_' + colIndex,
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
                                    x: _d.data.tileW / 2,
                                    y: _d.data.tileH - 15
                                },
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
                                captureData: _d.captureData,
                                type: _d.type,
                                index: ++index
                            },
                            captureFunc: function (e) {
                                this.changeFrame(util.extend({}, this.c.captureData, {ticksPerFrame: 1}));
                            },
                            releaseFunc: function (e) {
                                releaseFunc.call(this, e, _d);
                                // this.changeFrame(_d.data);
                                // this.changeStatus(5);
                                // stage.addDisplayObject(
                                //     createBoomSprite(
                                //         this.x - boomData.tileW / 2 * ratioX + 10,
                                //         this.y - boomData.tileH / 2 * ratioY + 10
                                //     )
                                // );
                            },
                            moveFunc: function (e) {
                                moveFunc.call(this, e);
                            }
                        });
                        stage.addDisplayObject(balloonSprite);
                    })(d);
                }
            }

            var tmp = [];
            function moveFunc(e) {
                // this 是指开始的那个，就是触发 captureFunc 的那个
                // 同时也是 holdSprites 的第一个
                var holdSprites = e.holdSprites;
                var len = holdSprites.length;
                var first = holdSprites[0];
                var last = holdSprites[len - 1];
                if (len > 1) {
                    for (var i = 1, j = 0; i <= len - 1; i++, j++) {
                        var cur = holdSprites[i];
                        var prev = holdSprites[j];
                        if (cur.c.type !== prev.c.type && prev.c.index !== first.c.index) {
                            tmp.push(prev);
                            break;
                        }

                        var sub = cur.c.index - prev.c.index;
                        var firstSub = cur.c.index - first.c.index;
                        console.warn(sub, firstSub);
                        if (cur.c.type === prev.c.type
                            && (sub === -7 || sub === -6 || sub === -5
                            || sub === -1 || sub === 1
                            || sub === 5 || sub === 6 || sub === 7
                            || sub === 0

                            || firstSub === -7 || firstSub === -6 || firstSub === -5
                            || firstSub === -1 || firstSub === 1
                            || firstSub === 5 || firstSub === 6 || firstSub === 7
                            || firstSub === 0)
                            // || sub / 7 === 1 || sub / 6 === 1 || sub / 5 === 1 || sub / 1 === 1
                        ) {
                            cur.changeFrame(cur.c.captureData);
                        }
                        if (tmp.length) {
                            for (var q = 0, tmpLen = tmp.length; q < tmpLen; q++) {
                                var sub = last.c.index - tmp[q].c.index;
                                if (last.c.type === tmp[q].c.type
                                    &&
                                    (
                                        sub === -7 || sub === -6 || sub === -5
                                            || sub === -1 || sub === 1
                                            || sub === 5 || sub === 6 || sub === 7
                                            || sub === 0
                                    )
                                    // || sub / 7 === 1 || sub / 6 === 1 || sub / 5 === 1 || sub / 1 === 1
                                ) {
                                    last.changeFrame(last.c.captureData);
                                }
                            }
                        }
                    }
                }
                // tmp = null;
            }

            function releaseFunc(e, d) {
                tmp = [];
                this.changeFrame(d.data);
                // this.changeStatus(5);
                // stage.addDisplayObject(
                //     createBoomSprite(
                //         this.x - boomData.tileW / 2 * ratioX + 10,
                //         this.y - boomData.tileH / 2 * ratioY + 10
                //     )
                // );
            }

            // function moveFunc(e) {
            //     var holdSprites = e.holdSprites;
            //     for (var i = 0, j = -1, len = holdSprites.length; i < len; i++, j++) {
            //         var hs = holdSprites[i];
            //         var prev = holdSprites[j] || this;

            //         if (hs.c.index === this.c.index) {
            //             continue;
            //         }

            //         // console.warn(holdSprites);
            //         if (prev.c.type === hs.c.type && this.c.type === hs.c.type) {
            //             var sub = prev.c.index - hs.c.index;
            //             if (sub === -7 || sub === -6 || sub === -5
            //                 || sub === -1 || sub === 1
            //                 || sub === 5 || sub === 6 || sub === 7
            //                 || sub === 0
            //                 // || sub / 7 === 1 || sub / 6 === 1 || sub / 5 === 1 || sub / 1 === 1
            //             ) {
            //                 hs.changeFrame(hs.c.captureData);
            //             }
            //         }
            //     }
            // }

            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            });
        }
    );
};
