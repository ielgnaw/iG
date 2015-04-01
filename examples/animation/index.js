/* global ig */
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
            }
        ],
        function (resource) {
            var bitmap = new ig.Bitmap({
                x: canvas.width / 2 - resource.playBut.width / 2 + 5,
                y: 100
                , image: resource.playBut
            });
            game.createStage({
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
            }).addDisplayObject(bitmap);

            var am = new ig.Animation({
                fps: 50,
                source: bitmap
                // , repeat: 1
                // , tween: ig.easing.easeOutBounce
                , duration: 1000
                , target: {
                    // x: 180
                }
                , range: {
                    y: 20
                }
            }).play().on('repeat', function () {
                // console.warn(arguments);
            });

            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            });
        }
    );
};
