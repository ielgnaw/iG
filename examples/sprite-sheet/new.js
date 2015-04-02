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
            var orange = spritesData.orange;

            var obj = new ig.SpriteSheet({
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
                ticksPerFrame: 2
            });
            stage.addDisplayObject(obj);

            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            });
        }
    );
};
