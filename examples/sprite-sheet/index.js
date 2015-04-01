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


            for (var i = 0; i < 10; i++) {
                var obj = new ig.SpriteSheet({
                    image: resource.ss3,
                    x: ig.util.randomInt(30, canvas.width),
                    y: ig.util.randomInt(40, canvas.height),
                    frameStartX: 0,
                    // frameStartY: ig.util.randomInt(1, 10),
                    frameStartY: 0,
                    total: 16 + 16 + 9,
                    frameWidth: 64,
                    frameHeight: 86,
                    zIndex: i,
                    ticksPerFrame: 2
                });
                stage.addDisplayObject(obj);

                var obj1 = new ig.SpriteSheet({
                    image: resource.test1,
                    x: ig.util.randomInt(30, canvas.width),
                    y: ig.util.randomInt(40, canvas.height),
                    frameStartX: 0,
                    frameStartY: 0,
                    total: 7,
                    frameWidth: 180,
                    frameHeight: 100,
                    zIndex: i+1,
                    ticksPerFrame: 1,
                    offsets: {
                        0: {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0
                        },
                        1: {
                            x: 20,
                            y: 0,
                            width: 0,
                            height: 0
                        }
                        ,2: {
                            x: 25,
                            y: 0,
                            width: 0,
                            height: 0
                        },
                        3: {
                            x: 30,
                            y: 0,
                            width: 0,
                            height: 0
                        },
                        4: {
                            x: 40,
                            y: 0,
                            width: 0,
                            height: 0
                        },
                        5: {
                            x: 50,
                            y: 0,
                            width: 0,
                            height: 0
                        },
                        6: {
                            x: 60,
                            y: 0,
                            width: 0,
                            height: 0
                        }
                    }
                });
                stage.addDisplayObject(obj1);

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
