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
        // , maxWidth: 700
        // , maxHeight: 700
    });

    ig.loadResource(
        [
            {
                id: 'bg',
                src: './img/bg5.jpg'
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
                // ,repeat: 'repeat'
            });

            var count = 3;
            for (var i = 0; i < count; i++) {
                var point1 = {
                    x: Math.floor(util.randomFloat(30, 100)),
                    y: Math.floor(util.randomFloat(40, 120))
                };
                var point2 = {
                    x: point1.x + Math.floor(util.randomFloat(10, 30)),
                    y: point1.y + Math.floor(util.randomFloat(10, 40))
                };
                var point3 = {
                    x: Math.floor(util.randomFloat(point1.x + 10, point2.x + 10)),
                    y: point2.y + Math.floor(util.randomFloat(10, 40))
                };
                var point4 = {
                    x: Math.floor(util.randomFloat(0, point1.x - 10)),
                    y: Math.floor(util.randomFloat(point2.y + 10, point3.y + 10))
                };
                var polygon = new ig.geom.Polygon({
                    x: Math.floor(util.randomFloat(300, canvas.width - 300)),
                    y: Math.floor(util.randomFloat(300, canvas.height - 300)),
                    points: [point1, point2, point3, point4]
                    , vX: 5 // util.randomFloat(-5, 5)
                    , vY: -5 // util.randomFloat(-5, 5)
                    , fillStyle: '#' + ((1 << 24) * Math.random() | 0).toString(16)
                    // , debug: true
                    , angle: 30
                });

                polygon.update = function () {
                    var w = this.stageOwner.width;
                    var h = this.stageOwner.height;

                    this.getBounds();

                    if (this.bounds.x <= 0 || this.bounds.x + this.bounds.width >= w) {
                        this.vX = -this.vX;
                    }
                    if (this.bounds.y <= 0 || this.bounds.y + this.bounds.height >= h) {
                        this.vY = -this.vY;
                    }

                    this.moveStep();

                    var displayObjectList = this.stageOwner.displayObjectList;
                    for (var i = 0, len = displayObjectList.length; i < len; i++) {
                        if (displayObjectList[i] instanceof ig.geom.Polygon
                            && this.name !== displayObjectList[i].name
                        ) {
                            var collideResponse = this.intersects(displayObjectList[i], true);
                            if (collideResponse) {
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

                        if (displayObjectList[i] instanceof ig.geom.Circle
                            && this.name !== displayObjectList[i].name
                        ) {
                            // console.warn(1);
                            var collideResponse = this.intersectsCircle(displayObjectList[i], true);
                            if (collideResponse) {
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

                polygon.render = function (ctx) {
                    var points = this.points;
                    var i = points.length;

                    ctx.save();
                    ctx.fillStyle = this.fillStyle || '#000';
                    ctx.translate(this.x, this.y);
                    // ctx.rotate(util.deg2Rad(this.angle));
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    while (i--) {
                        ctx.lineTo(points[i].x, points[i].y);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.translate(-this.x, -this.y);
                    this.debugRender(ctx);
                    ctx.restore();
                }

                stage.addDisplayObject(polygon);
            }

            var circleCount = 3;
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

                        if (displayObjectList[i] instanceof ig.geom.Polygon
                            && this.name !== displayObjectList[i].name
                        ) {
                            var collideResponse = this.intersectsPolygon(displayObjectList[i], true);
                            if (collideResponse) {
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
