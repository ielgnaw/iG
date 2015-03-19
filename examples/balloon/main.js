(function () {

    'use strict';

    /* global ig */

    var maskerNode = document.querySelector('.masker');
    var loadingNode = document.querySelector('.loading');

    var imageLoader = new ig.ImageLoader({
        allCallback: function () {
            loadComplete();
        },
        source: [
            './img/tmp1.png',
            './img/tmp2.jpeg',
            './img/tmp3.jpeg',
            './img/tmp4.jpg',
            './img/tmp5.jpg',
            './img/tmp6.jpg',
            './img/tmp7.jpg',
            './img/tmp8.jpg',
            './img/tmp9.png',
            './img/tmp10.png',
            './img/tmp11.png',
            './img/tmp12.png',
            './img/tmp13.png',
            {
                id: 'bg',
                src: './img/bg.jpg'
            },
            {
                id: 'playBut',
                src: './img/playBut.png'
            }
        ]
    });

    imageLoader.on('ImageLoader:imageLoaded', function (data) {
        loadingNode.innerHTML = data.data.progress.toFixed(0) + '%';
    });

    imageLoader.load();

    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');

    var game;
    var stage;

    function loadComplete() {
        maskerNode.style.display = 'none';

        game = new ig.Game();

        stage = game.createStage({
            bgColor: '#fff',
            canvas: canvas
        });

        // 初始化背景
        initBg();

        // 初始化开始屏幕的元素
        initStartScreen();

        // test
        // var ballCount = 155;
        // for (var i = 0; i < ballCount; i++) {
        //     var obj = new ig.Shape.Ball({
        //         name: i,
        //         radius: 10
        //     });
        //     obj.move(ig.util.randomInt(20, 400), ig.util.randomInt(20, 300));
        //     obj.vX = ig.util.randomInt(5, 10);
        //     obj.vY = ig.util.randomInt(5, 10);
        //     obj.color = ''
        //         + 'rgba('
        //         + ig.util.randomInt(0, 255)
        //         + ','
        //         + ig.util.randomInt(0, 255)
        //         + ','
        //         + ig.util.randomInt(0, 255)
        //         + ', '
        //         + ig.util.randomFloat(1, 1)
        //         + ')';
        //     stage.addDisplayObject(obj);

        //     // obj.on('DisplayObject:render', function (data) {
        //     //     console.log('DisplayObject:render', data);
        //     // });
        // }

        game.start();

        // var g = new ig.Game();
        // g.on('Game:afterRender', function (data) {
        //     // console.log('当前帧数：' + data.data.curFrame);
        // });

        // // ctx.fillStyle = '#fff';
        // // ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 50, 200, 100);
        // // debugger
        // // ctx.fillStyle = '#fff';
        // // ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 50, 200, 100);
        // stage = g.createStage({
        //     // width: 500,
        //     // height: 300,
        //     // bgColor: 'green',
        //     canvas: canvas
        // });

        // for (var i = 0; i < 1; i++) {
        //     var obj = new ig.SpriteSheet({
        //         image: li.imageList[0],
        //         // x: ig.util.randomInt(30, canvas.width - 50),
        //         x: canvas.width - 50,
        //         // y: ig.util.randomInt(40, canvas.height - 50),
        //         y: canvas.height - 100,
        //         frameStartX: 0,
        //         // frameStartY: ig.util.randomInt(1, 10),
        //         frameStartY: 0,
        //         total: 16 + 16 + 9,
        //         frameWidth: 64,
        //         frameHeight: 86,
        //         zIndex: i
        //     });
        //     stage.addDisplayObject(obj);

        //     var obj1 = new ig.SpriteSheet({
        //         image: li.imageList[1],
        //         // x: ig.util.randomInt(30, canvas.width - 50),
        //         x: canvas.width - 150,
        //         // y: ig.util.randomInt(40, canvas.height - 50),
        //         y: canvas.height - 200,
        //         frameStartX: 0,
        //         frameStartY: 0,
        //         total: 7,
        //         frameWidth: 180,
        //         frameHeight: 100,
        //         zIndex: i+1,
        //         offsets: {
        //             0: {
        //                 x: 0,
        //                 y: 0,
        //                 width: 0,
        //                 height: 0
        //             },
        //             1: {
        //                 x: 20,
        //                 y: 0,
        //                 width: 0,
        //                 height: 0
        //             }
        //             ,2: {
        //                 x: 25,
        //                 y: 0,
        //                 width: 0,
        //                 height: 0
        //             },
        //             3: {
        //                 x: 30,
        //                 y: 0,
        //                 width: 0,
        //                 height: 0
        //             },
        //             4: {
        //                 x: 40,
        //                 y: 0,
        //                 width: 0,
        //                 height: 0
        //             },
        //             5: {
        //                 x: 50,
        //                 y: 0,
        //                 width: 0,
        //                 height: 0
        //             },
        //             6: {
        //                 x: 60,
        //                 y: 0,
        //                 width: 0,
        //                 height: 0
        //             }
        //         }
        //     });
        //     stage.addDisplayObject(obj1);
        // }

        // setTimeout(function () {
        //     // stage.setBgImg('./img/sprite-sheet1.png', 'full');
        //     // console.warn(111);
        //     // stage.setSize(100, 300);
        // }, 3000);

        // canvas.addEventListener('click', function() {
        //     console.warn(1);
        // }, false);

        // g.start();
    }

    /**
     * 初始化开始屏幕的元素
     */
    function initStartScreen() {
        var obj = new ig.SpriteSheet({
            image: imageLoader.images.playBut,
            x: canvas.width / 2, // 绘制的形状的左上角的横坐标
            y: canvas.height / 2 + 100, // 绘制的形状的左上角的纵坐标
            total: 1,
            frameWidth: 114,
            frameHeight: 115,
            zIndex: 1
        });

        var originalY = obj.y;
        var range = 5;

        // 重写父类的 update
        obj.update = function () {
            var me = this;

            if (originalY - me.y > range) {
                me.setAcceleration(0, 0.05);
            }
            else {
                me.setAcceleration(0, -0.05);
            }

            // 调用父类 DisplayObject 的 moveStep
            me.moveStep();
        }
        stage.addDisplayObject(obj);
    }

    /**
     * 初始化背景
     */
    function initBg() {
        var parallaxBg = new ig.ParallaxScroll({
            image: imageLoader.images.bg,
            aX: 0,
            aY: 0,
            x: 0,
            y: 0,
            zIndex: 0
        });
        stage.addDisplayObject(parallaxBg);

        var _index = 0;
        function loop(timestamp) {
            _index++;
            if (_index % 2000 === 0) {
                parallaxBg.setAcceleration(0.3, 0.3);
                setTimeout(function () {
                    window.requestAnimationFrame(loop);
                }, 32000);
            }
            else {
                window.requestAnimationFrame(loop);
                parallaxBg.setAcceleration(-0.3, 0.3);
            }
        }

        window.requestAnimationFrame(loop);
    }



})();
