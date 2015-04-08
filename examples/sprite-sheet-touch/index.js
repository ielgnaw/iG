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
                    data: allData.red,
                    captureData: allData.redCapture
                },
                {
                    data: allData.orange,
                    captureData: allData.orangeCapture
                },
                {
                    data: allData.yellow,
                    captureData: allData.yellowCapture
                },
                {
                    data: allData.green,
                    captureData: allData.greenCapture
                },
                {
                    data: allData.blue,
                    captureData: allData.blueCapture
                },
                {
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
            var countInCol = 7;

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

            for (var rowIndex = 0; rowIndex < countInRow; rowIndex++) {
                for (var colIndex = 1; colIndex < countInCol + 1; colIndex++) {
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
                                    y: _d.data.tileH - 10
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
                            captureData: _d.captureData,
                            captureFunc: function (e) {
                                this.changeFrame(_d.captureData);
                            },
                            releaseFunc: function (e) {
                                this.changeFrame(_d.data);
                                this.changeStatus(5);
                                stage.addDisplayObject(
                                    createBoomSprite(this.x - boomData.tileW / 2 * ratioX + 10, this.y - boomData.tileH / 2 * ratioY + 10)
                                );
                            },
                            moveFunc: function (e) {
                                var holdSprites = e.holdSprites;
                                for (var i in holdSprites) {
                                    var hs = holdSprites[i];
                                    if (hs instanceof ig.SpriteSheet
                                        // && /^red\d+$/.test(hs.name)
                                    ) {
                                        hs.changeFrame(hs.captureData);
                                    }
                                }
                            }
                        });
                        stage.addDisplayObject(balloonSprite);
                    })(d);
                }
            }

            console.warn(stage);

            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            });
        }
    );
};
