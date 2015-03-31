window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');

    var game = new ig.Game({
        fps: 30,
        name: 'game1'
    });

    game.init({
        canvas: canvas
        , maximize: true
        , scaleFit: true
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
                id: 'panel',
                src: '../img/panel.png'
            }
        ],
        function (resource) {

            /**
             * 弹力
             *
             * @type {number}
             */
            var spring = 0.03;

            /**
             * 摩擦力
             *
             * @type {number}
             */
            var friction = 0.9;

            var coverWidth = 326;
            var coverHeight = 320;

            var coverTargetY = 30;
            var coverTargetX = canvas.width / 2 - coverWidth / 2;

            var cover = new ig.Bitmap({
                image: resource.panel,
                // vY: -0.3,
                x: canvas.width / 2 - coverWidth / 2
                , y: canvas.height / 2 - coverHeight / 2
                , sX: 28
                , sY: 1680
                , width: coverWidth
                , height: coverHeight
                , mouseEnable: true
            });

            cover.update = function (dt) {
                var dx = coverTargetX - this.x;
                var ax = dx * spring;
                var dy = coverTargetY - this.y;
                var ay = dy * spring;
                this.setAccelerationX(ax);
                this.setAccelerationY(ay);
                this.setFrictionY(friction);
                this.setFrictionX(friction);
                // 调用父类 DisplayObject 的 moveStep
                this.moveStep();
            };

            var playBut = new ig.Bitmap({
                x: canvas.width,
                y: canvas.height / 2 + 110
                , width: 110
                , height: 110
                , image: resource.playBut
                // , debug: true
                , mouseEnable: true
            });

            var originalY = playBut.y;
            var rangeX = 5;

            var targetX = canvas.width / 2 - 55;

            playBut.update = function () {
                var dx = targetX - this.x;
                var ax = dx * spring;
                this.setAccelerationX(ax);
                this.setFrictionX(friction);

                if (originalY - this.y > rangeX) {
                    this.setAcceleration(0, 0.05);
                }
                else {
                    this.setAcceleration(0, -0.05);
                }
                // 调用父类 DisplayObject 的 moveStep
                this.moveStep();
            };

            playBut.setCaptureFunc(function (e) {
                coverTargetY = 60;
                cover.setPos(canvas.width, coverTargetY);
                cover.setSY(78);
                playBut.setPos(0, playBut.y);
            });

            var stage = game.createStage({
                name: 'bg'
            }).setParallaxScroll({
                image: resource.bg
                , anims: [
                    {
                        aX: 1
                        , aY: 1
                    },
                    {
                        aX: -1
                        , aY: 1
                    }
                ]
                , animInterval: 1000 // 切换 parallax 的间隔，这里指的是帧数间隔
            });

            stage.addDisplayObject(cover);
            stage.addDisplayObject(playBut);
            console.log(stage);

            function drawGrid(ctx, color, stepx, stepy) {
               ctx.strokeStyle = color;
               ctx.lineWidth = 0.5;

               for (var i = stepx + 0.5; i < ctx.canvas.width; i += stepx) {
                  ctx.beginPath();
                  ctx.moveTo(i, 0);
                  ctx.lineTo(i, ctx.canvas.height);
                  ctx.stroke();
               }

               for (var i = stepy + 0.5; i < ctx.canvas.height; i += stepy) {
                  ctx.beginPath();
                  ctx.moveTo(0, i);
                  ctx.lineTo(ctx.canvas.width, i);
                  ctx.stroke();
               }
            }

            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            }).on('afterGameRender', function (data) {
                drawGrid(stage.ctx, 'red', (canvas.width) / 6, (canvas.height) / 7);
            })
        }
    );
};
