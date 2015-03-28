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

            var circle = new ig.geom.Circle({
                x: 50,
                y: 50,
                radius: 25
                // , vX: 5
                // , vY: 0
            });

            circle.update = function () {
                var w = this.stageOwner.width;
                var h = this.stageOwner.height;

                if (this.x < this.radius || this.x > w - this.radius) {
                    this.vX = -this.vX;
                };
                if (this.y < this.radius || this.y > h - this.radius) {
                    this.vY = -this.vY;
                }
                this.moveStep();

                // if (this.hitTestPoint(85, 50)) {
                    // console.warn('p');
                // }
            };

            circle.render = function (ctx) {
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = 'red';
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }


            var circle2 = new ig.geom.Circle({
                x: 150,
                y: 50,
                radius: 25
                , vX: -1
                , vY: 0
            });

            circle2.update = function () {
                var w = this.stageOwner.width;
                var h = this.stageOwner.height;

                if (this.x < this.radius || this.x > w - this.radius) {
                    this.vX = -this.vX;
                };
                if (this.y < this.radius || this.y > h - this.radius) {
                    this.vY = -this.vY;
                }
                this.moveStep();

                console.warn(this.intersects(circle));

                // if (this.hitTestPoint(85, 50)) {
                    // console.warn('p');
                // }
            };

            circle2.render = function (ctx) {
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = 'red';
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }


            stage.addDisplayObject(circle);
            stage.addDisplayObject(circle2);

            // var ballCount = 5;
            // for (var i = 0; i < ballCount; i++) {
            //     var obj = new ig.Shape.Ball({
            //         name: 'name' + i,
            //         radius: 20
            //     });
            //     // obj.move(ig.util.randomInt(10, canvas.width - 10), ig.util.randomInt(10, canvas.height - 10));
            //     obj.move(ig.util.randomInt(10, 100), ig.util.randomInt(10, 100));
            //     obj.vX = ig.util.randomInt(1, 5);
            //     obj.vY = ig.util.randomInt(1, 5);
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
