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
            },
            {
                id: 'panel',
                src: './img/panel.png'
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
        // debugger
        stage = game.createStage({
            bgColor: '#fff',
            canvas: canvas
        });

        // 初始化背景
        initBg();

        // 初始化开始屏幕的元素
        initStartScreen();
        game.start();
    }

    var spring = 0.03;
    var friction = 0.9;

    /**
     * 初始化开始屏幕的元素
     */
    function initStartScreen() {
        var playBut = new ig.SpriteSheet({
            image: imageLoader.images.playBut,
            // x: canvas.width / 2, // 绘制的形状的左上角的横坐标
            x: canvas.width,// - 10,
            y: canvas.height / 2 + 140, // 绘制的形状的左上角的纵坐标
            total: 1,
            frameWidth: 114,
            frameHeight: 115,
            zIndex: 2
        });

        var originalY = playBut.y;
        var rangeX = 5;

        var targetX = canvas.width / 2;

        // 重写父类的 update
        playBut.update = function () {
            var me = this;
            var dx = targetX - me.x;
            var ax = dx * spring;
            me.setAccelerationX(ax);
            me.setFrictionX(friction);

            if (originalY - me.y > rangeX) {
                me.setAcceleration(0, 0.05);
            }
            else {
                me.setAcceleration(0, -0.05);
            }
            // 调用父类 DisplayObject 的 moveStep
            me.moveStep();
        };

        stage.addDisplayObject(playBut);

        var targetY = 140;
        var panel1 = new ig.SpriteSheet({
            image: imageLoader.images.panel,
            // x: canvas.width / 2, // 绘制的形状的左上角的横坐标
            x: canvas.width / 2,
            y: canvas.height, // 绘制的形状的左上角的纵坐标
            total: 1,
            frameWidth: 380,
            frameHeight: 400,
            relativeY: 1600,
            zIndex: 1
        });

        var rangeY = 5;
        var originalPanelY = panel1.y;

        // 重写父类的 update
        panel1.update = function () {
            var me = this;
            var dy = targetY - me.y;
            var ay = dy * spring;
            me.setAccelerationY(ay);
            me.setFrictionY(friction);

            // 调用父类 DisplayObject 的 moveStep
            me.moveStep();
        };

        stage.addDisplayObject(panel1);

        // test
        setTimeout(function () {
            // debugger
            stage.removeDisplayObject(panel1);

            var targetY = 140;
            var panel2 = new ig.SpriteSheet({
                image: imageLoader.images.panel,
                // x: canvas.width / 2, // 绘制的形状的左上角的横坐标
                x: canvas.width / 2,
                y: canvas.height, // 绘制的形状的左上角的纵坐标
                total: 1,
                frameWidth: 380,
                frameHeight: 400,
                zIndex: 1
            });

            var rangeY = 5;
            var originalPanelY = panel2.y;

            // 重写父类的 update
            panel2.update = function () {
                var me = this;
                var dy = targetY - me.y;
                var ay = dy * spring;
                me.setAccelerationY(ay);
                me.setFrictionY(friction);

                // 调用父类 DisplayObject 的 moveStep
                me.moveStep();
            };

            stage.addDisplayObject(panel2);
        }, 1000);
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
