/* global ig */

'use strict';

window.onload = function () {
    var canvas = document.querySelector('#canvas');

    var game = new ig.Game({
        canvas: canvas,
        name: 'balloon-game',
        maximize: 1,
        resource: [
            {id: 'bg', src: '/examples/img/game/balloon/bg.jpg'},
            {id: 'panel', src: '/examples/img/game/balloon/panel.png'},
            {id: 'playBut', src: '/examples/img/game/balloon/playBut.png'},
            {id: 'spriteSheetData', src: './data/sprite-sheet1.json'}
        ]
    }).on('loadResProcess', function (e) {
        document.querySelector('#load-process').innerHTML
            = 'loadProcess: ' + (e.data.loadedCount / e.data.total).toFixed(1) * 100 + '%'
    }).on('loadResDone', function (e) {
        document.querySelector('#load-process').style.display = 'none';
    });

    var stage = game.createStage({
        name: 'balloon-stage',
        parallaxOpts: [
            {
                image: 'bg',
                anims: [
                    {
                        ax: 1,
                        ay: 1
                    },
                    {
                        ax: -1,
                        ay: 1
                    }
                ],
                animInterval: 1000
            }
        ],
        moveFunc: function (d) {
            d.domEvent.preventDefault();
        }
    });

    var coverWidth = 326;
    var coverHeight = 320;

    var startCover = stage.addDisplayObject(
        new ig.Bitmap({
            name: 'startCover',
            image: 'panel',
            x: stage.width / 2 - coverWidth / 2,
            y: -100,
            sx: 28,
            sy: 1680,
            // debug: 1,
            sWidth: coverWidth,
            sHeight: coverHeight,
            width: coverWidth,
            height: coverHeight,
            mouseEnable: true,
            zIndex: 1,
            moveFunc: function (d) {
                d.domEvent.preventDefault();
                this.move(d.x, d.y);
            }
        })
    );

    // var startCover = new ig.Bitmap({
    //     name: 'startCover',
    //     image: resource.panel,
    //     x: stage.width / 2 - coverWidth * ratioX / 2,
    //     y: 500,
    //     sX: 28,
    //     sY: 1680,
    //     scaleX: ratioX,
    //     scaleY: ratioY,
    //     width: coverWidth,
    //     height: coverHeight,
    //     mouseEnable: true
    // });

    game.start('asdda', function () {
        startCover.setAnimate({
            target: {
                y: stage.height / 2 - coverHeight / 2 - 100 * game.ratioX
            },
            tween: ig.easing.easeOutBounce
        });
        // stage1.setBgImg(test, 'full');
        // console.warn(stage1);
        // console.warn(game);
    }).on('gameFPS', function (e) {
        // console.warn(e.data.fps);
        document.querySelector('#fps').innerHTML = 'fps: ' + e.data.fps;
    });

    return;
};

