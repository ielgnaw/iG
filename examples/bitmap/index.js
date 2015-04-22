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
                src: '../img/bg5.jpg'
            },
            {
                id: 'playBut',
                src: '../img/playBut.png'
            }
        ],
        function (resource) {

            var bitmap = new ig.Bitmap({
                x: 150,
                y: 150
                // , vX: 5
                // , vY: -5
                , width: 80
                , height: 80
                , sWidth: 100
                , sHeight: 100
                // , points: [
                //     {
                //         x: 0,
                //         y: 0
                //     },
                //     {
                //         x: 100,
                //         y: 0
                //     },
                //     {
                //         x: 100,
                //         y: 100
                //     },
                //     {
                //         x: 0,
                //         y: 100
                //     }
                // ]
                , image: resource.playBut
                , debug: true
                , mouseEnable: true
            });

            bitmap.setCaptureFunc(function (e) {
                console.log(e, 1);
                console.warn(this,1);
            });

            bitmap.setMoveFunc(function (e) {
                this.x = e.x;
                this.y = e.y;
                // console.log(e, 1);
                // console.warn(this,1);
            });

            bitmap.update = function () {
                var w = this.stageOwner.width;
                var h = this.stageOwner.height;

                if (this.bounds.x <= 0 || this.bounds.x + this.bounds.width >= w) {
                    this.vX = -this.vX;
                }
                if (this.bounds.y <= 0 || this.bounds.y + this.bounds.height >= h) {
                    this.vY = -this.vY;
                }

                this.moveStep();
                // console.warn(this.hitTestPoint(181, 181));

                // var displayObjectList = this.stageOwner.displayObjectList;
                // for (var i = 0, len = displayObjectList.length; i < len; i++) {
                //     if (displayObjectList[i] instanceof ig.geom.Polygon
                //         && this.name !== displayObjectList[i].name
                //     ) {
                //         var collideResponse = this.intersects(displayObjectList[i], true);
                //         if (collideResponse) {
                //             this.vX -= collideResponse.overlapV.x;// / 10;
                //             this.vY -= collideResponse.overlapV.y;// / 10;

                //             // 减速
                //             if (Math.abs(this.vX) >= 20) {
                //                 this.frictionX = .5;
                //             }
                //             else {
                //                 this.frictionX = 1;
                //             }
                //             if (Math.abs(this.vY) >= 20) {
                //                 this.frictionY = .5;
                //             }
                //             else {
                //                 this.frictionY = 1;
                //             }
                //         }
                //     }

                //     if (displayObjectList[i] instanceof ig.geom.Circle
                //         && this.name !== displayObjectList[i].name
                //     ) {
                //         // console.warn(1);
                //         var collideResponse = this.intersectsCircle(displayObjectList[i], true);
                //         if (collideResponse) {
                //             this.vX -= collideResponse.overlapV.x;// / 10;
                //             this.vY -= collideResponse.overlapV.y;// / 10;

                //             // 减速
                //             if (Math.abs(this.vX) >= 20) {
                //                 this.frictionX = .5;
                //             }
                //             else {
                //                 this.frictionX = 1;
                //             }
                //             if (Math.abs(this.vY) >= 20) {
                //                 this.frictionY = .5;
                //             }
                //             else {
                //                 this.frictionY = 1;
                //             }
                //         }
                //     }
                // }
            };

            game.createStage({
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
            }).addDisplayObject(bitmap);

            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            });
        }
    );
};
