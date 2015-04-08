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

            var spritesData = resource.spritesData;

            // 红色气球
            var red = spritesData.red;
            var redSprite = new ig.SpriteSheet({
                name: 'red',
                image: resource.ss3,
                x: stage.width / 2,
                y: stage.height / 2,
                sX: red.sX,
                sY: red.sY,
                total: red.total,
                tileW: red.tileW,
                tileH: red.tileH,
                cols: red.cols,
                rows: red.rows,
                zIndex: 1,
                ticksPerFrame: 3,
                // debug: 1,
                mouseEnable: true
            });

            var redCapture = spritesData.redCapture;
            var smallBoom = spritesData.smallBoom;

            redSprite.setCaptureFunc(function (e) {
                redSprite.changeFrame(redCapture);
            });

            redSprite.setReleaseFunc(function (e) {
                redSprite.changeFrame(red);
            });

            redSprite.setMoveFunc(function (e) {
                var holdSprites = e.holdSprites;
                for (var i in holdSprites) {
                    var hs = holdSprites[i];
                    if (hs instanceof ig.SpriteSheet) {
                        if (hs.name == 'red') {
                            hs.changeFrame(redCapture);
                        }
                        else if (hs.name == 'orange') {
                            hs.changeFrame(orangeCapture);
                        }
                    }
                }
            });

            var orange = spritesData.orange;
            var orangeSprite = new ig.SpriteSheet({
                name: 'orange',
                image: resource.ss3,
                x: stage.width / 2 + 64,
                y: stage.height / 2,
                sX: orange.sX,
                sY: orange.sY,
                total: orange.total,
                tileW: orange.tileW,
                tileH: orange.tileH,
                cols: orange.cols,
                rows: orange.rows,
                zIndex: 1,
                ticksPerFrame: 3,
                // debug: 1,
                mouseEnable: true
            });

            var redCapture = spritesData.redCapture;
            var orangeCapture = spritesData.orangeCapture;
            var smallBoom = spritesData.smallBoom;

            orangeSprite.setCaptureFunc(function (e) {
                orangeSprite.changeFrame(orangeCapture);
            });

            orangeSprite.setReleaseFunc(function (e) {
                orangeSprite.changeFrame(orange);
            });

            orangeSprite.setMoveFunc(function (e) {
                var holdSprites = e.holdSprites;
                for (var i in holdSprites) {
                    var hs = holdSprites[i];
                    if (hs instanceof ig.SpriteSheet) {
                        if (hs.name == 'red') {
                            hs.changeFrame(redCapture);
                        }
                        else if (hs.name == 'orange') {
                            hs.changeFrame(orangeCapture);
                        }
                    }
                }
            });

            stage.addDisplayObject(redSprite);
            stage.addDisplayObject(orangeSprite);

            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            });
        }
    );
};
