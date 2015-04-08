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
                                    x: 10,
                                    y: 10
                                },
                                {
                                    x: _d.data.tileW - 10,
                                    y: 10
                                },
                                {
                                    x: _d.data.tileW / 2,
                                    y: _d.data.tileH - 20
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
                                this.changeFrame(_d.data);
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

            var lastHoldSprite;

            function moveFunc(e) {
                var holdSprites = e.holdSprites;
                lastHoldSprite = holdSprites[holdSprites.length - 1];
                for (var i = 0, len = holdSprites.length; i < len; i++) {
                    var hs = holdSprites[i];
                    if (this.c.type === hs.c.type) {
                        var sub = lastHoldSprite.c.index - hs.c.index;
                        // -7  -6  -5
                        // -1   c   1
                        // 5   6   7
                        if (sub === -7 || sub === -6 || sub === -5
                            || sub === -1 || sub === 1
                            || sub === 5 || sub === 6 || sub === 7
                            || sub === 0
                            // || sub / 7 === 1 || sub / 6 === 1 || sub / 5 === 1 || sub / 1 === 1
                        ) {
                            console.warn(sub);
                            hs.changeFrame(hs.c.captureData);
                        }
                    }
                }
                lastHoldSprite = null;
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
