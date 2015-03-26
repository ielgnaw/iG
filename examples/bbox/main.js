window.onload = function () {

    var util = ig.util;

    function BBox(opts) {
        // 中心坐标
        this.x = opts.x;
        this.y = opts.y;

        this.fillStyle = opts.fillStyle;
        this.strokeStyle = opts.strokeStyle;
    }

    BBox.prototype = {
        constructor: BBox,
        isCollide: function (bbox) {
            // if (this.constructor.ClassName != bbox.constructor.ClassName) {
            //     throw Error('Box Type mismatch! ');
            // } else {
                return this.collided(bbox);
            // }
        },
        collided: function (bbox) {
            throw Error('This method must be override by child class!');
        },
        getType: function () {
            return this.constructor.ClassName;
        },
        // 显示包围盒
        show: function (ctx) {
            throw Error('This method must be override by child class!');
        }
    }

    function CircleBBox(opts) {
        this.radius = opts.radius;
        BBox.apply(this, arguments);
    }

    CircleBBox.prototype = {
        constructor: CircleBBox,
        collided: function (tBox) {
            var dx = this.x - tBox.x;
            var dy = this.y - tBox.y;
            var dr = this.radius + tBox.radius;
            return dx * dx + dy * dy < dr * dr;
        },
        show: function (ctx) {
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = this.strokeStyle || this.color;
            ctx.lineWidth = 2;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    util.inherits(CircleBBox, BBox);

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
            // }).setBgImg(resource.bg.src, 'full');
            // }).setBgColor('green');
            });
            stage.setParallaxScroll({
                image: resource.bg
                // , aX: 1
                // , aY: 1
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

            var ballCount = 5;
            for (var i = 0; i < ballCount; i++) {
                var obj = new ig.Shape.Ball({
                    name: 'name' + i,
                    radius: 20
                });
                // obj.move(ig.util.randomInt(10, canvas.width - 10), ig.util.randomInt(10, canvas.height - 10));
                obj.move(ig.util.randomInt(10, 100), ig.util.randomInt(10, 100));
                obj.vX = ig.util.randomInt(1, 5);
                obj.vY = ig.util.randomInt(1, 5);
                obj.color = 'red';
                obj.setBBox(new CircleBBox({
                    x: obj.x,
                    y: obj.y,
                    radius: obj.radius
                }));
                stage.addDisplayObject(obj);
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
