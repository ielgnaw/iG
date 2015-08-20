/* global ig */

'use strict';

window.onload = function () {

    var util = ig.util;
    var CONFIG = ig.getConfig();
    var STATUS = CONFIG.status;
    var canvas = document.querySelector('#canvas');
    var loadProcessNode = document.querySelector('#load-process');
    var shareNode = document.querySelector('.share');
    var playAgainNode = document.querySelector('.play-again');
    var shareContainerNode = document.querySelector('.share-container');
    var storage = new ig.Storage();

    document.addEventListener('touchmove', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    var ALL_COUNT = 99;  // 237

    var RES = [];
    // for (var i = 0; i <= 237; i++) {
    for (var i = 0; i <= ALL_COUNT; i++) {
        RES.push({
            id: 'img' + i,
            src: './img/' + i + '.png'
        });
    }

    RES.push({
        id: 'guide1',
        src: './img/guide1.png'
    });

    RES.push({
        id: 'guide2',
        src: './img/guide2.png'
    });

    var game = new ig.Game({
        canvas: canvas,
        name: 'demoGame',
        maximize: 1,
        resource: RES
    }).on('loadResProcess', function (e) {
        loadProcessNode.style.display = 'block';
        loadProcessNode.style.left = (game.width / 2 - 110 / 2) + 'px';
        loadProcessNode.style.top = (game.height / 2 - 30 / 2) + 'px';
        var t = e.data.loadedCount / e.data.total * 100;
        t = String(t).split('.');
        loadProcessNode.innerHTML = 'loading: ' + t[0] + '%';
    }).on('loadResDone', function (e) {
        loadProcessNode.style.display = 'none';
    });

    var stage = game.createStage({
        name: 'demoStage',
        bgColor: '#000',
        captureFunc: function (e) {
            stageCaptureFunc.call(this, e);
        },
        moveFunc: function (e) {
            stageMoveFunc.call(this, e);
        },
        releaseFunc: function (e) {
            stageReleaseFunc.call(this, e);
        }
    });

    var gameIsStart = false;

    /**
     * stage capture 回调事件
     */
    function stageCaptureFunc(e) {
        // if (!gameIsStart || game.paused) {
        //     return;
        // }
    }

    /**
     * stage move 回调事件
     */
    function stageMoveFunc(e) {
        // if (!gameIsStart || game.paused) {
        //     return;
        // }
    }

    /**
     * stage release 回调事件
     */
    function stageReleaseFunc(e) {
        // if (!gameIsStart || game.paused) {
        //     return;
        // }
    }

    var width = game.width;
    var height = width / 4 * 3;

    if (height > game.height) {
        height = game.height;
        width = height / 3 * 4;
    }

    var img = stage.addDisplayObject(
        new ig.Bitmap({
            name: 'img',
            image: 'img0',
            x: (game.width - width) / 2,
            y: (game.height - 510 * 625 / 800) / 2,
            // width: width,
            zIndex: 1,
            sx: 90,
            width: width,
            sWidth: 625,
            // height: 429
            // height: 510 * 625 / 800,
            height: 510 * 625 / 800,
            // debug: 1
        })
    );
    console.warn(game);

    // 582

    // game.start('demoStage', function () {
    //     gameIsStart = true;
    //     var asset = game.asset;
    //     var index = 0;

    //     ig.loop({
    //         step: function (dt, stepCount, requestID) {
    //             // console.warn(stepCount);
    //         },
    //         exec: function (execCount) {
    //             if (i < ALL_COUNT) {
    //                 i++;
    //             }
    //             else {
    //                 i = 0;
    //             }
    //             img.change({
    //                 asset: game.asset['img' + i]
    //             });
    //         },
    //         jumpFrames: 3
    //     });
    // });

    // document.querySelector('#start').addEventListener('click', function (e) {
        // var node = this;
        // node.className = 'guide guide2';
        game.start('demoStage', function () {
            // node.style.display = 'none';
            gameIsStart = true;
            var asset = game.asset;
            var index = 0;

            ig.loop({
                step: function (dt, stepCount, requestID) {
                    // console.warn(stepCount);
                },
                exec: function (execCount) {
                    if (i < ALL_COUNT) {
                        i++;
                    }
                    else {
                        i = 0;
                    }
                    img.change({
                        asset: game.asset['img' + i]
                    });
                },
                jumpFrames: 3
            });
        });

    // });
};

