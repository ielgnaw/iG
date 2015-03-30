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

            var circleCount = 5;
            for (var c = 0; c < circleCount; c++) {
                var circle = new ig.geom.Circle({
                    x: util.randomInt(50, canvas.width - 80),
                    y: util.randomInt(50, canvas.height - 80),
                    radius: 25
                    , vX: util.randomInt(-5, 5)
                    , vY: util.randomInt(-5, 5)
                    , fillStyle: '#' + ((1 << 24) * Math.random() | 0).toString(16)
                    // , debug: true
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
                    // this.scaleX = .5;
                    // this.scaleY = .5;


                    this.moveStep();

                    var displayObjectList = this.stageOwner.displayObjectList;
                    for (var i = 0, len = displayObjectList.length; i < len; i++) {
                        if (displayObjectList[i] instanceof ig.geom.Circle
                            && this.name !== displayObjectList[i].name
                        ) {
                            var collideResponse = this.intersects(displayObjectList[i], true);
                            if (collideResponse) {
                                if (collideResponse.overlapV.x) {
                                    // debugger
                                    // console.warn(collideResponse.overlapV.x);
                                }

                                this.vX -= collideResponse.overlapV.x;// / 10;
                                this.vY -= collideResponse.overlapV.y;// / 10;

                                // 减速
                                if (Math.abs(this.vX) >= 20) {
                                    this.frictionX = .5;
                                }
                                else {
                                    this.frictionX = 1;
                                }
                                if (Math.abs(this.vY) >= 20) {
                                    this.frictionY = .5;
                                }
                                else {
                                    this.frictionY = 1;
                                }
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

            game.start(function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            })
        }
    );
};
