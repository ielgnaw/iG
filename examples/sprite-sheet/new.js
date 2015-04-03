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
                // frameStartX: 0,
                sX: red.sX,
                // frameStartY: ig.util.randomInt(1, 10),
                // frameStartY: 0,
                sY: red.sY,
                // total: 16 + 16 + 9,
                total: red.total,
                // frameWidth: 64,
                tileW: red.tileW,
                // frameHeight: 86,
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
                // frameStartX: 0,
                sX: orange.sX,
                // frameStartY: ig.util.randomInt(1, 10),
                // frameStartY: 0,
                sY: orange.sY,
                // total: 16 + 16 + 9,
                total: orange.total,
                // frameWidth: 64,
                tileW: orange.tileW,
                // frameHeight: 86,
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
                // frameStartX: 0,
                sX: smallBoom.sX,
                // frameStartY: ig.util.randomInt(1, 10),
                // frameStartY: 0,
                sY: smallBoom.sY,
                // total: 16 + 16 + 9,
                total: smallBoom.total,
                // frameWidth: 64,
                tileW: smallBoom.tileW,
                // frameHeight: 86,
                tileH: smallBoom.tileH,
                cols: smallBoom.cols,
                rows: smallBoom.rows,
                zIndex: 1,
                ticksPerFrame: 5
            });
            stage.addDisplayObject(smallBoom);

            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            });
        }
    );
};
