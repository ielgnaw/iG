/* global ig */

'use strict';

window.onload = function () {
    var util = ig.util;
    var CONFIG = ig.getConfig();
    var STATUS = CONFIG.status;
    var canvas = document.querySelector('#canvas');
    var loadProcessNode = document.querySelector('#load-process');
    var storage = new ig.Storage();

    document.addEventListener('touchmove', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    var game = new ig.Game({
        canvas: canvas,
        name: 'xiongchumoGame',
        maximize: 1,
        resource: [
            {id: 'bg', src: './img/bg.jpg'},
            {id: 'spritesImg', src: './img/sprites.png'},
            {id: 'spritesData', src: './data/sprites.json'},
        ]
    }).on('loadResProcess', function (e) {
        loadProcessNode.style.display = 'block';
        loadProcessNode.style.left = (game.width / 2 - 110 / 2) + 'px';
        loadProcessNode.style.top = (game.height / 2 - 30 / 2) + 'px';
        loadProcessNode.innerHTML
            = 'loading: ' + (e.data.loadedCount / e.data.total).toFixed(1) * 100 + '%';
    }).on('loadResDone', function (e) {
        loadProcessNode.style.display = 'none';
    });

    var spritesData;
    var gameIsStart = false;

    var stage = game.createStage({
        name: 'xiongchumoStage',
        bgColor: '#000',
        captureFunc: function (e) {
            stageCaptureFunc.call(this, e);
        },
        moveFunc: function (e) {
            stageMoveFunc.call(this, e);
        },
        releaseFunc: function (e) {
            // stageReleaseFunc.call(this, e);
        }
    });

    var bgSheet = stage.addDisplayObject(
        new ig.SpriteSheet({
            name: 'bg',
            image: 'bg',
            sheet: 'spritesData',
            sheetKey: 'bg',
            jumpFrames: 1.2, // [0.5, 1.2]
            zIndex: 1,
            debug: 1,
            width: CONFIG.width * game.ratioX,
            height: CONFIG.height * game.ratioY
        })
    );

    var player = stage.addDisplayObject(
        new ig.SpriteSheet({
            name: 'player',
            image: 'spritesImg',
            sheet: 'spritesData',
            x: -100,
            sheetKey: 'normalRun',
            y: 200 * game.ratioY,
            zIndex: 10,
            jumpFrames: 4,
            runStatus: 'normal',
            debug: 1,
            // moveFunc: function (d) {
            //     // 跳起
            //     if (d.y < this.y / 2 && !this.isJump) {
            //         this.isJump = true;
            //         this.image = spritesImg1;
            //         this.y -= 20;
            //         this.changeFrame(util.extend(true, {
            //             isOnce: true,
            //             onceDone: function () {
            //                 this.image = spritesImg;
            //                 this.changeFrame(normalRunData);
            //                 this.y += 20;
            //                 this.isJump = false;
            //             }
            //         }, jumpRunData));
            //     }
            //     else {
            //         if (d.x > 46 && d.x < 223) {
            //             this.move(d.x, this.y);
            //         }
            //     }
            // }
        })
    );

    /**
     * stage capture 回调事件
     *
     * @param {Object} e captureFunc 的回调参数
     */
    function stageCaptureFunc(e) {
        if (!gameIsStart || game.paused) {
            return;
        }
        player.move(e.x, player.y);
    }

    /**
     * stage move 回调事件
     *
     * @param {Object} e moveFunc 毁掉参数
     */
    function stageMoveFunc(e) {
        if (!gameIsStart || game.paused) {
            return;
        }
        player.move(e.x, player.y);
    }

    game.start(function () {
        gameIsStart = true;
        spritesData = game.asset.spritesData;
        player.move((game.width - spritesData.normalRun.tileW) / 2, player.y);

        pinecone.setup({
            game: game,
            stage: stage,
            spritesData: spritesData,
            player: player
        });

        guide.setup({
            game: game,
            stage: stage
        });

        setTimeout(function () {
            guide.initGuideStep1();
        }, 1000);

        // boomData = game.asset.boomData;
        // allData = game.asset.spriteSheetData;
        // spritesData = [
        //     {type:'red', data: allData.red, captureData: allData.redCapture},
        //     {type:'orange', data: allData.orange, captureData: allData.orangeCapture},
        //     {type:'yellow', data: allData.yellow, captureData: allData.yellowCapture},
        //     {type:'green', data: allData.green, captureData: allData.greenCapture},
        //     {type:'blue', data: allData.blue, captureData: allData.blueCapture},
        //     {type:'pink', data: allData.pink, captureData: allData.pinkCapture}
        // ];

        // startCover.setAnimate({
        //     target: {
        //         y: stage.height / 2 - coverHeight * game.ratioY / 2 - 100 * game.ratioY
        //     },
        //     tween: ig.easing.easeOutBounce
        // });
        // playBut.setAnimate({
        //     target: {
        //         x: stage.width / 2 - 108 * game.ratioX / 2
        //     },
        //     tween: ig.easing.easeOutBounce,
        //     duration: 1500,
        //     completeFunc: function (e) {
        //         e.data.source.setAnimate({
        //             range: {
        //                 y: 10
        //             },
        //             duration: 1500,
        //             repeat: 1
        //         }).setCaptureFunc(function (e) {
        //             e.domEvent.preventDefault();
        //             if (startCover.startIndex === 0) {
        //                 startCover.startIndex = 1;
        //                 var tmpX = startCover.x;
        //                 startCover.setAnimate({
        //                     target: {
        //                         x: -500
        //                     },
        //                     duration: 200,
        //                     completeFunc: function (e) {
        //                         e.data.source.change({
        //                             sy: 78,
        //                             x: stage.width + 100,
        //                             y: stage.height / 2 - coverHeight * game.ratioY / 2 - 50 * game.ratioY
        //                         }).setAnimate({
        //                             target: {
        //                                 x: tmpX
        //                             },
        //                             duration: 1000,
        //                             tween: ig.easing.easeOutBounce
        //                         });
        //                     }
        //                 });
        //             }
        //             else {
        //                 initHud();
        //                 initBalloon();
        //                 playBut.setStatus(STATUS.DESTROYED);
        //                 startCover.setStatus(STATUS.DESTROYED);
        //                 stage.setParallax({
        //                     image: 'bg'
        //                 });

        //                 gameIsStart = true;
        //                 countDownFunc();
        //             }
        //         });
        //     }
        // });

    });
};

