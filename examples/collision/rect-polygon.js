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

            var count = 5;
            for (var i = 0; i < count; i++) {
                var rect = new ig.geom.Rect({
                x: Math.floor(util.randomFloat(200, canvas.width - 200)),
                y: Math.floor(util.randomFloat(200, canvas.height - 200)),
                width: Math.floor(util.randomFloat(50, 100)),
                height: Math.floor(util.randomFloat(50, 100))
                , vX: 5 // util.randomFloat(-5, 5)
                , vY: -5 // util.randomFloat(-5, 5)
                , fillStyle: '#' + ((1 << 24) * Math.random() | 0).toString(16)
                , debug: true
            });

            rect.update = function () {
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
                    if (displayObjectList[i] instanceof ig.geom.Rect
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
                }
            };

            rect.render = function (ctx) {
                var points = this.points;
                var i = points.length;
                // debugger

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

                stage.addDisplayObject(rect);
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
