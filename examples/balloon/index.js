/* global ig */

'use strict';

window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');

    var game = new ig.Game({
        fps: 30,
        name: 'game1'
    });

    game.init({
        canvas: canvas,
        maximize: true,
        scaleFit: true
    });

    // 标准宽度
    var STANDARD_WIDTH = 383;

    // 标准高度
    var STANDARD_HEIGHT = 550;

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
            },
            {
                id: 'ss3',
                src: '../img/sprite-sheet3.png'
            },
            {
                id: 'spritesData',
                src: './data/sprite-sheet3.json'
            },
            {
                id: 'boom',
                src: '../img/boom.png'
            },
            {
                id: 'boomData',
                src: './data/boom.json'
            },
            {
                id: 'hud',
                src: '../img/hud.png'
            }
        ],
        function (resource) {
            resourceLoaded(resource);
            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                // document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            });
        }
    );

    var spring = 0.02;
    var friction = 0.89;

    var stage;
    var ratioX;
    var ratioY;

    /**
     * 资源加载完成的回调
     *
     * @param {Object} resource 资源对象
     */
    function resourceLoaded(resource) {
        stage = game.createStage({
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

        ratioX = stage.width / STANDARD_WIDTH;
        ratioY = stage.height / STANDARD_HEIGHT;

        // initStartScreen(resource);
        var text = new ig.Text({
            name: 'text',
            x: 150,
            y: 150,
            color: 'rgba(0, 0, 0, 0.5)',
            size: 20,
            content: '60',
            animate: {
                // y: text.y - 50,
                y: -50,
                alpha: 0,
                scaleX: 1.5,
                scaleY: 1.5,
                color: '#f00',
                // duration: 1000,
                complete: function () {}
            }
        });
        stage.addDisplayObject(text);
        // setInterval(function () {
        //     var content = text.getContent();
        //     console.warn(content);
        //     content--;
        //     text.changeContent(content);
        // }, 1000);
        // new ig.Animation({
        //     source: text,
        //     duration: 1000,
        //     target: {
        //         y: text.y - 50,
        //         alpha: 0,
        //         scaleX: 1.5,
        //         scaleY: 1.5,
        //         color: '#f00'
        //     }
        // }).play().on('complete', function (d) {
        //     console.log(d);
        //     d.data.source.status = 5;
        //     console.warn(stage);

        // });
    }

    /**
     * 初始化开始屏幕
     *
     * @param {Object} resource 资源对象
     */
    function initStartScreen(resource) {

        var coverWidth = 326;
        var coverHeight = 320;

        var coverTargetY = 20 * ratioY;
        var coverTargetX = stage.width / 2 - coverWidth * ratioX / 2;

        var startCover = new ig.Bitmap({
            name: 'startCover',
            image: resource.panel,
            x: stage.width / 2 - coverWidth * ratioX / 2,
            y: 500,
            sX: 28,
            sY: 1680,
            scaleX: ratioX,
            scaleY: ratioY,
            width: coverWidth,
            height: coverHeight,
            mouseEnable: true
        });

        startCover.update = function (dt) {
            var dy = coverTargetY - this.y;
            var ay = dy * spring;
            this.setAccelerationY(ay);
            this.setFrictionY(friction);

            var dx = coverTargetX - this.x;
            var ax = dx * spring;
            this.setAccelerationX(ax);
            this.setFrictionX(friction);

            // 调用父类 DisplayObject 的 moveStep
            this.moveStep();
        };
        stage.addDisplayObject(startCover);

        // 开始按钮
        var playBut = new ig.Bitmap({
            name: 'playBut',
            x: stage.width + resource.playBut.width,
            y: stage.height - 150 * ratioY,
            width: 108,
            height: 108,
            scaleX: ratioX,
            scaleY: ratioY,
            image: resource.playBut,
            mouseEnable: true
            // , debug: true
        });

        var playButTargetX = stage.width / 2 - resource.playBut.width * ratioX / 2

        playBut.update = function () {
            var dx = playButTargetX - this.x;
            var ax = dx * spring;
            this.setAccelerationX(ax);
            this.setFrictionX(friction);

            // 调用父类 DisplayObject 的 moveStep
            this.moveStep();
        };

        playBut.setCaptureFunc(function (e) {
            if (!startCover.c.canStart) {
                startCover.c.canStart = true;
                coverTargetY = 40 * ratioY;
                startCover.setPos(stage.width, coverTargetY);
                startCover.setSY(78);
                playBut.setPos(0 - resource.playBut.width, playBut.y);
                console.warn(startCover.c);
            }
            else {
                startCover.c.canStart = false;
                startCover.status = 5;
                playBut.status = 5;
                initStage(resource);
            }
        });

        new ig.Animation({
            fps: 50,
            source: playBut
            , duration: 2000
            , range: {
                y: 10
            },
            repeat: 1
        }).play();

        stage.addDisplayObject(playBut);
    }

    function initStage(resource) {
        console.warn(resource);
        console.warn(stage);

        var hud = new ig.Bitmap({
            name: 'hud',
            x: 0,
            y: 0,
            width: 383,
            height: 550,
            scaleX: ratioX,
            scaleY: ratioY,
            image: resource.hud,
            mouseEnable: true
            // , debug: true
        });
        stage.addDisplayObject(hud);
    }


};
