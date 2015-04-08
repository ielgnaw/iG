window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');

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
                id: 'playBut',
                src: '../img/playBut.png'
            },
            {
                id: 'test2',
                src: '../img/test2.png'
            },
            {
                id: 'test1',
                src: '../img/test1.png'
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
                id: 'ss2',
                src: '../img/sprite-sheet2.jpg'
            },
            {
                id: 'spritesData1',
                src: './data/sprite-sheet2.json'
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
            var red = new ig.SpriteSheet({
                name: 0,
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
                ticksPerFrame: 10
            });
            stage.addDisplayObject(red);

            var orange = spritesData.orange;
            var orange = new ig.SpriteSheet({
                name: 1,
                image: resource.ss3,
                x: 100,
                y: 100,
                sX: orange.sX,
                sY: orange.sY,
                total: orange.total,
                tileW: orange.tileW,
                tileH: orange.tileH,
                cols: orange.cols,
                rows: orange.rows,
                zIndex: 1,
                ticksPerFrame:1
            });
            stage.addDisplayObject(orange);

            var smallBoom = spritesData.smallBoom;
            var smallBoom = new ig.SpriteSheet({
                name: 2,
                image: resource.ss3,
                x: 210,
                y: 210,
                sX: smallBoom.sX,
                sY: smallBoom.sY,
                total: smallBoom.total,
                tileW: smallBoom.tileW,
                tileH: smallBoom.tileH,
                cols: smallBoom.cols,
                rows: smallBoom.rows,
                zIndex: 1,
                ticksPerFrame: 5
            });
            stage.addDisplayObject(smallBoom);

            var redCapture = spritesData.redCapture;
            var redCapture = new ig.SpriteSheet({
                name: 3,
                image: resource.ss3,
                x: 150,
                y: 300,
                sX: redCapture.sX,
                sY: redCapture.sY,
                total: redCapture.total,
                tileW: redCapture.tileW,
                tileH: redCapture.tileH,
                cols: redCapture.cols,
                rows: redCapture.rows,
                zIndex: 1,
                ticksPerFrame: 10
            });
            stage.addDisplayObject(redCapture);

            var spritesData1 = resource.spritesData1;
            var boom1 = spritesData1.boom1;
            var boom1 = new ig.SpriteSheet({
                name: 4,
                image: resource.ss2,
                x: 150,
                y: 500,
                sX: boom1.sX,
                sY: boom1.sY,
                total: boom1.total,
                tileW: boom1.tileW,
                tileH: boom1.tileH,
                cols: boom1.cols,
                rows: boom1.rows,
                zIndex: 1,
                ticksPerFrame: 10
            });
            stage.addDisplayObject(boom1);

            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            });
        }
    );
};
