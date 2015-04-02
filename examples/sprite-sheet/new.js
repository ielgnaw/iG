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
            console.warn(red);

            var obj = new ig.SpriteSheet({
                image: resource.ss3,
                x: stage.width / 2,
                y: stage.height / 2,
                // frameStartX: 0,
                frameStartX: red.sx,
                // frameStartY: ig.util.randomInt(1, 10),
                // frameStartY: 0,
                frameStartY: red.sy,
                // total: 16 + 16 + 9,
                total: red.total,
                // frameWidth: 64,
                frameWidth: red.tilew,
                // frameHeight: 86,
                frameHeight: red.tileh,
                zIndex: 1,
                ticksPerFrame: 10
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
