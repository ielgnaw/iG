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

            var stage = game.createStage({
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
            console.warn(game);
            setTimeout(function () {
                // debugger
                game.swapStageByName('stage-name', 'stage-name1');
            }, 3000)

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
