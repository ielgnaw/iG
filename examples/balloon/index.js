/* global ig */

'use strict';

window.onload = function () {
    var canvas = document.querySelector('#canvas');

    var util = ig.util;
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
            image: resource.bg,
            anims: [
                {
                    aX: 1,
                    aY: 1
                },
                {
                    aX: -1,
                    aY: 1
                }
            ],
            animInterval: 1000 // 切换 parallax 的间隔，这里指的是帧数间隔
        });

        ratioX = stage.width / STANDARD_WIDTH;
        ratioY = stage.height / STANDARD_HEIGHT;

        initStartScreen(resource);
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

        var playButTargetX = stage.width / 2 - resource.playBut.width * ratioX / 2;

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
            source: playBut,
            duration: 2000,
            range: {
                y: 10
            },
            repeat: true
        }).play();

        stage.addDisplayObject(playBut);
    }

    function initStage(resource) {
        var hud = new ig.Bitmap({
            name: 'hud',
            x: 0,
            y: 0,
            width: 383,
            height: 70,
            scaleX: ratioX,
            scaleY: ratioY,
            image: resource.hud,
            mouseEnable: true,
            zIndex: 1
            // , debug: true
        });
        stage.addDisplayObject(hud);

        var content = 60;
        var text = new ig.Text({
            name: 'text',
            x: (stage.ctx.measureText(content).width + 22) * ratioX,
            y: 48 * ratioY,
            color: '#fff',
            size: 32 * ratioX,
            content: content,
            zIndex: 2
        });

        text.setAnimate({
            duration: 1000,
            target: {
                alpha: 0,
            },
            repeat: true,
            repeatFunc: function (d) {
                var sourceObj = d.data.source;
                var content = parseInt(sourceObj.getContent(), 10);
                content--;
                if (content >= 0) {
                    if (content < 10) {
                        content = '0' + content;
                    }
                    sourceObj.changeContent(content);
                }
                else {
                    sourceObj.stopAnimate();
                    // game.stop();
                }
            }
        });

        stage.addDisplayObject(text);

        initBalloon(resource);
    }

    function initBalloon(resource) {
        var allData = resource.spritesData;

        var spritesData = [
            {
                type:'red',
                data: allData.red,
                captureData: allData.redCapture
            },
            {
                type:'orange',
                data: allData.orange,
                captureData: allData.orangeCapture
            },
            {
                type:'yellow',
                data: allData.yellow,
                captureData: allData.yellowCapture
            },
            {
                type:'green',
                data: allData.green,
                captureData: allData.greenCapture
            },
            {
                type:'blue',
                data: allData.blue,
                captureData: allData.blueCapture
            },
            {
                type:'pink',
                data: allData.pink,
                captureData: allData.pinkCapture
            }
        ];

        var boomData = resource.boomData.boom;

        // 场景的宽度
        var width = stage.width;

        // 场景的高度
        var height = stage.height;

        // 六列
        var countInRow = 6;

        // 七行
        var countInCol = 7 + 1;

        var ratioX = width / (countInRow * 64);
        var ratioY = height / (countInCol * 86);
        console.warn(ratioX, ratioY, game);

        var guid = 0;
        function createBoomSprite(x, y, c, callback) {
            return new ig.SpriteSheet({
                x: x,
                y: y,
                name: 'boom' + (guid++),
                image: resource.boom,
                sX: boomData.sX,
                sY: boomData.sY,
                total: boomData.total,
                tileW: boomData.tileW,
                tileH: boomData.tileH,
                cols: boomData.cols,
                rows: boomData.rows,
                offsetX: boomData.offsetX,
                offsetY: boomData.offsetY,
                zIndex: 10,
                ticksPerFrame: 1,
                scaleX: ratioX,
                scaleY: ratioY,
                isOnce: true,
                onceDone: callback || util.noop,
                c: c || {}
            });
        }

        var index = 0;

        /* jshint loopfunc:true */
        for (var colIndex = 1; colIndex < countInCol; colIndex++) {
            for (var rowIndex = 0; rowIndex < countInRow; rowIndex++) {
                var d = spritesData[util.randomInt(0, 5)];
                (function (_d) {
                    var balloonSprite = new ig.SpriteSheet({
                        name: rowIndex + '_' + colIndex,
                        image: resource.ss3,
                        x: rowIndex * _d.data.tileW * ratioX,
                        y: colIndex * _d.data.tileH * ratioY,
                        // 用 points 更精确捕捉 touch 事件
                        points: [
                            {
                                x: 5,
                                y: 10
                            },
                            {
                                x: _d.data.tileW - 5,
                                y: 10
                            },
                            {
                                x: 45,
                                y: _d.data.tileH - 20
                            },
                            {
                                x: _d.data.tileW - 45,
                                y: _d.data.tileH - 20
                            }
                        ],
                        sX: _d.data.sX,
                        sY: _d.data.sY,
                        total: _d.data.total,
                        tileW: _d.data.tileW,
                        tileH: _d.data.tileH,
                        cols: _d.data.cols,
                        rows: _d.data.rows,
                        zIndex: 2,
                        ticksPerFrame: 2,
                        scaleX: ratioX,
                        scaleY: ratioY,
                        // debug: 1,
                        mouseEnable: true,
                        c: {
                            data: _d.data,
                            captureData: _d.captureData,
                            type: _d.type,
                            index: ++index
                        },
                        captureFunc: function (e) {
                            captureFunc.call(this, e);
                        },
                        releaseFunc: function (e) {
                            releaseFunc.call(this, e, _d);
                        },
                        moveFunc: function (e) {
                            moveFunc.call(this, e);
                        }
                    });
                    stage.addDisplayObject(balloonSprite);
                })(d);
            }
        }

        var abs = Math.abs;
        var canBoomBalloons = [];

        function inCanBoomBalloons(displayObjectName) {
            for (var i = 0, len = canBoomBalloons.length; i < len; i++) {
                if (canBoomBalloons[i].name === displayObjectName) {
                    return true;
                }
            }
            return false;
        }

        function captureFunc(e) {
            this.changeFrame(util.extend({}, this.c.captureData, {ticksPerFrame: 1}));
        }

        var holdSprites;

        function moveFunc(e) {
            holdSprites = e.holdSprites;
            var first = holdSprites[0];
            util.removeArrByCondition(holdSprites, function (item) {
                return item.c.type !== first.c.type;
            });
            console.warn(holdSprites);

            var len = holdSprites.length;

            for (var i = 0, j = -1; i < len; i++, j++) {
                var cur = holdSprites[i];
                var prev = holdSprites[j] || cur;
                var sub = abs(cur.c.index - prev.c.index);
                if (sub !== 5 && sub !== 6 && sub !== 7 && sub !== 1 && sub !== 0) {
                    prev.changeFrame(prev.c.data);
                    util.removeArrByCondition(canBoomBalloons, function (item) {
                        return item.name !== prev.name;
                    });
                    return;
                }
                else {
                    cur.changeFrame(cur.c.captureData);
                    if (!inCanBoomBalloons(cur.name)) {
                        canBoomBalloons.push(cur);
                    }
                }
            }
        }

        function releaseFunc(e, d) {
            holdSprites = [];
            this.changeFrame(d.data);
            var len = canBoomBalloons.length;
            if (len >= 3) {
                while (canBoomBalloons.length) {
                    var curBoomBalloon = canBoomBalloons.shift();
                    curBoomBalloon.changeStatus(5);
                    var boomSprite = createBoomSprite(
                        curBoomBalloon.x - boomData.tileW / 2 * ratioX + 10,
                        curBoomBalloon.y - boomData.tileH / 2 * ratioY + 10,
                        {
                            boomBalloon: curBoomBalloon
                        },
                        boomSpriteOnceDone
                    );
                    stage.addDisplayObject(boomSprite);
                    // boomSpriteOnceDone(boomSprite);
                }
            }
            canBoomBalloons = [];
        }

        function boomSpriteOnceDone(boomSprite) {
            var curBoomBalloon = boomSprite.c.boomBalloon;
            var d = spritesData[util.randomInt(0, 5)];
            var balloonSprite = new ig.SpriteSheet({
                name: curBoomBalloon.name,
                image: resource.ss3,
                x: curBoomBalloon.x,
                y: curBoomBalloon.y,
                points: [
                    {
                        x: 5,
                        y: 10
                    },
                    {
                        x: d.data.tileW - 5,
                        y: 10
                    },
                    {
                        x: 45,
                        y: d.data.tileH - 20
                    },
                    {
                        x: d.data.tileW - 45,
                        y: d.data.tileH - 20
                    }
                ],
                sX: d.data.sX,
                sY: d.data.sY,
                total: d.data.total,
                tileW: d.data.tileW,
                tileH: d.data.tileH,
                cols: d.data.cols,
                rows: d.data.rows,
                zIndex: 2,
                ticksPerFrame: 2,
                scaleX: 0.2,
                scaleY: 0.2,
                // debug: 1,
                mouseEnable: true,
                c: {
                    data: d.data,
                    captureData: d.captureData,
                    type: d.type,
                    index: curBoomBalloon.c.index
                },
                captureFunc: function (e) {
                    captureFunc.call(this, e);
                },
                releaseFunc: function (e) {
                    releaseFunc.call(this, e, d);
                },
                moveFunc: function (e) {
                    moveFunc.call(this, e);
                }
            });
            stage.addDisplayObject(balloonSprite);

            new ig.Animation({
                fps: 50,
                source: balloonSprite,
                duration: 200,
                target: {
                    scaleX: ratioX,
                    scaleY: ratioY
                }
            }).play();
        }
    }
};

