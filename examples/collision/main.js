window.onload = function () {

    var util = ig.util;

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
        // , pageScroll: true
        // , width: 200
        // , height: 200
        // , maxHeight: 100
        // , maxWidth: 100
    });

    ig.loadResource(
        [
            {
                id: 'bg',
                src: './img/bg.jpg'
            },
            {
                id: 'bg1',
                src: './img/700*700-1.jpeg'
            },
            {
                id: 'bg2',
                src: './img/bg2.jpg'
            }
        ],
        function (resource) {
            var stage = game.createStage({
                name: 'bg'
            });
            stage.setParallaxScroll({
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
                , animInterval: 1000
            });

            var circleCount = 2;
            for (var c = 0; c < circleCount; c++) {
                var circle = new ig.geom.Circle({
                    x: util.randomInt(50, canvas.width - 80),
                    y: util.randomInt(50, canvas.height - 80),
                    radius: 25
                    , vX: util.randomInt(-5, 5)
                    , vY: util.randomInt(-5, 5)
                    , fillStyle: '#' + ((1 << 24) * Math.random() | 0).toString(16)
                    , debug: true
                });

                circle.update = function () {
                    var w = this.stageOwner.width;
                    var h = this.stageOwner.height;

                    if (this.x < this.radius * this.scaleX || this.x > w - this.radius * this.scaleX) {
                        this.vX = -this.vX;
                    };
                    if (this.y < this.radius * this.scaleX || this.y > h - this.radius * this.scaleX) {
                        this.vY = -this.vY;
                    }

                    // 圆形的 scaleX 和 scaleY 应该一致
                    this.scaleX = .5;
                    this.scaleY = .5;


                    this.moveStep();

                    var displayObjectList = this.stageOwner.displayObjectList;
                    for (var i = 0, len = displayObjectList.length; i < len; i++) {
                        if (displayObjectList[i] instanceof ig.geom.Circle) {
                            var collideResponse = this.intersects(displayObjectList[i], true);
                            if (collideResponse) {
                                if (collideResponse.overlapV.x) {
                                    // debugger
                                }
                                this.vX -= collideResponse.overlapV.x;
                                this.vY -= collideResponse.overlapV.y;
                            }
                        }
                    }
                };

                circle.render = function (ctx) {
                    // debugger
                    ctx.save();
                    ctx.globalAlpha = this.alpha;
                    ctx.translate(this.x, this.y);
                    ctx.rotate(util.deg2Rad(this.angle));
                    ctx.scale(this.scaleX, this.scaleY);
                    ctx.translate(-this.x, -this.y);
                    // ctx.restore();

                    // ctx.save();
                    ctx.beginPath();
                    ctx.fillStyle = this.fillStyle || '#000';
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.closePath();

                    this.debugRender(ctx);

                    ctx.restore();

                }

                stage.addDisplayObject(circle);
            }


            // var ballCount = 5;
            // for (var i = 0; i < ballCount; i++) {
            //     var obj = new ig.Shape.Ball({
            //         name: 'name' + i,
            //         radius: 20
            //     });
            //     // obj.move(util.randomInt(10, canvas.width - 10), util.randomInt(10, canvas.height - 10));
            //     obj.move(util.randomInt(10, 100), util.randomInt(10, 100));
            //     obj.vX = util.randomInt(1, 5);
            //     obj.vY = util.randomInt(1, 5);
            //     obj.color = 'red';
            //     obj.setBBox(new CircleBBox({
            //         x: obj.x,
            //         y: obj.y,
            //         radius: obj.radius
            //     }));
            //     stage.addDisplayObject(obj);
            // }

            game.start(function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            })
        }
    );
};
