'use strict';

/* global ig */

window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var fpsNode = document.querySelector('#fps');

    var game = new ig.Game(
        {
            canvas: canvas,
            name: 'stage-test-game',
            fps: 50,
            maximize: 1,
            // horizontalPageScroll: 100
        }
    ).on('beforeGameRender', function (d) {
        // console.warn('beforeGameRender', d);
    }).on('afterGameRender', function (d) {
        // console.warn('afterGameRender', d);
    }).on('gameFPS', function (d) {
        fpsNode.innerHTML = 'fps: ' + d.data.fps;
    })/*.start(function () {
        console.warn('start callback');
    })*/;

    game.loadResource(
        [
            '/examples/img/1.jpg',
            {
                id: 'bg',
                src: '/examples/img/bg.jpg'
            },
            {
                id: 'bg1',
                src: '/examples/img/1.jpg'
            },
            {
                id: 'jsonData',
                src: '/examples/resource-loader/data/test.json'
            },
            {
                id: 'textData',
                src: '/examples/resource-loader/data/text.text'
            }
        ],
        function (d) {
            var stage = game.createStage({
                name: 'stage-name'
            }).setParallax({
                image: d.bg,
                aX: 1,
                aY: 1,
                // repeat: 'repeat',
                // , anims: [
                //     {
                //         aX: 1
                //         , aY: 1
                //     },
                //     {
                //         aX: -1
                //         , aY: 1
                //     }
                // ]
                animInterval: 1000 // 切换 parallax 的间隔，这里指的是帧数间隔
            });

            var stage1 = game.createStage({
                name: 'stage-name1'
            }).setParallax({
                image: d.bg1,
                aX: 1,
                repeat: 'repeat-x',
                // , aY: 1
                // , anims: [
                //     {
                //         aX: 1
                //         , aY: 1
                //     },
                //     {
                //         aX: -1
                //         , aY: 1
                //     }
                // ]
                animInterval: 1000 // 切换 parallax 的间隔，这里指的是帧数间隔
            });

            game.start('stage-name');
            // console.warn(game);
            setTimeout(function () {
                // debugger
                // game.swapStageByName('stage-name', 'stage-name1');
            }, 3000);

            // stage.createDisplayObject();

            var text = new ig.Text({
                content: 'caonidaye',
                name: 'text1',
                x: 150,
                y: 150,
                // scaleX: 0.5,
                // scaleY: 0.5,
                size: 20,
                isBold: true,
                angle: 0,
                debug: 1
            });

            text.update = function () {
                // this.angle++;
            };

            stage.addDisplayObject(text);

            setTimeout(function () {
                // text.changeContent('我们我们我们我们我们玩')
            }, 3000)

            // console.warn(text);

            text.setAnimate({
                // target: {
                    // y: 110,
                    // scaleX: 1.5
                    // angle: 360
                // },
                // target: [
                //     {
                //         y: 110,
                //         scaleX: 1.5
                //     },
                //     {
                //         x: 200,
                //         scaleY: 1.5
                //     }
                // ],
                range: {
                    // y: 10,
                    scaleX: 0.5,
                    angle: 180
                },
                repeat: 1,
                // tween: ig.easing.easeInBounce,
                duration: 5000,
                stepFunc: function () {
                    // console.warn('step');
                },
                repeatFunc: function () {
                    // console.warn('repeat');
                },
                groupCompleteFunc: function () {
                    // console.warn('groupCompleteFunc');
                },
                completeFunc: function () {
                    // console.warn('completeFunc');
                }
            });

            setTimeout(function () {
                // text.stopAnimate();
            }, 1500)

            console.warn(text);


            // stage.setBgImg(d.bg);

            // setTimeout(function () {
            //     stage.setBgImg(d.bg1, 'center');
            //     setTimeout(function () {
            //         stage.setBgImg('', 'center');
            //     }, 3000);
            // }, 3000);

            // console.warn(game);

            // console.warn(stage);
        }
    );

    // stage.setBgColor('#f00');
};
