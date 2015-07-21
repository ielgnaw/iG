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
            {id: 'spritesImg1', src: './img/sprites1.png'},
            {id: 'boomImg', src: './img/boom.png'},
            {id: 'spritesData', src: './data/sprites.json'},
            {id: 'spritesData1', src: './data/sprites1.json'},
            {id: 'boomData', src: './data/boom.json'},
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
    var spritesData1;
    var boomData;
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
            stageReleaseFunc.call(this, e);
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
            // debug: 1,
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
            // sheetKey: 'normalRun',
            sheetKey: 'normalRun',
            y: 200 * game.ratioY,
            backupY: 200 * game.ratioY,
            zIndex: 10,
            jumpFrames: 4,
            runStatus: 'normal',
            // debug: 1,
        })
    );

    // 判断是否跳起的时间戳
    var captureTimer;
    var captureY;

    var captureX;

    /**
     * stage capture 回调事件
     */
    function stageCaptureFunc(e) {
        if (!gameIsStart || game.paused) {
            return;
        }
        captureTimer = Date.now();
        captureY = e.y;

        captureX = e.x;
        // player.move(e.x, player.y);
    }

    /**
     * stage move 回调事件
     */
    function stageMoveFunc(e) {
        if (!gameIsStart || game.paused || player.runStatus === 'jump') {
            return;
        }

        var x = player.x;
        var dx = e.x - captureX;
        if (x >= 50 * game.ratioX && x <= 270 * game.ratioX) {
            player.move(dx + x, player.y);
        }
        else {
            if (x < 50 * game.ratioX) {
                player.x = 50 * game.ratioX;
            }
            else if (x > 270 * game.ratioX) {
                player.x = 270 * game.ratioX;
            }
        }
        captureX = e.x;
    }

    /**
     * stage release 回调事件
     */
    function stageReleaseFunc(e) {
        if (!gameIsStart || game.paused) {
            return;
        }

        // 跳起
        if (Date.now() - captureTimer <= 500
            && captureY - e.y >= 70
            && player.runStatus === 'normal'
        ) {
            player.runStatus = 'jump';
            player.change(
                util.extend(true, {
                    asset: game.asset.spritesImg1,
                    width: 89,
                    jumpFrames: 8,
                    y: player.y - 50,
                    isOnce: true,
                    onceDone: function () {
                        player.change(
                            util.extend(true, {
                                width: 48,
                                jumpFrames: 4,
                                asset: game.asset.spritesImg,
                                status: STATUS.NORMAL,
                                y: player.backupY
                            }, spritesData.normalRun)
                        );
                        player.runStatus = 'normal';
                    }
                }, spritesData1.jumpRun)
            );
        }
    }


    game.start(function () {
        gameIsStart = true;
        spritesData = game.asset.spritesData;
        spritesData1 = game.asset.spritesData1;
        boomData = game.asset.boomData;
        player.move((game.width - spritesData.normalRun.tileW) / 2, player.y);

        pinecone.setup({
            game: game,
            stage: stage,
            spritesData: spritesData,
            boomData: boomData,
            player: player
        });

        stone.setup({
            game: game,
            stage: stage,
            spritesData: spritesData,
            boomData: boomData,
            player: player
        });

        rollBranch.setup({
            game: game,
            stage: stage,
            spritesData: spritesData,
            spritesData1: spritesData1,
            boomData: boomData,
            player: player
        });

        bear.setup({
            game: game,
            stage: stage,
            spritesData: spritesData,
            spritesData1: spritesData1,
            boomData: boomData,
            player: player
        });

        guide.setup({
            game: game,
            stage: stage
        });

        setTimeout(function () {
            guide.initGuideStep1();
        }, 1000);
    });
};

