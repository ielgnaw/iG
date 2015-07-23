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

    shareNode.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        shareContainerNode.style.display = 'block';
        document.title = '熊出没中跑出' + storage.getItem('curScore') + '米~';
    });

    playAgainNode.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        document.title = '熊出没';
        shareNode.style.display = 'none';
        playAgainNode.style.display = 'none';
        shareContainerNode.style.display = 'none';

        stage.clearAllDisplayObject();

        bg.jumpFrames = 1.5;
        stage.addDisplayObject(bg);
        resultText.changeContent('0米');
        stage.addDisplayObject(resultText);

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

        stage.addDisplayObject(player);

        game.increaseMeter = 1;
        game.result = 0;

        game.start(function () {
            gameIsStart = true;
            var t = setTimeout(function () {
                clearTimeout(t);
                // guide.initGuideStep1();

                // 不要引导就直接调用下面这句
                bear.create();
            }, 1000);
        });
    });

    shareContainerNode.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        shareContainerNode.style.display = 'none';
        document.title = '熊出没';
    });

    var resultText;

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
        resultText = new ig.Text({
            name: 'resultText',
            content: '00000000米',
            // content: '1米',
            x: game.width - 125 * game.ratioX,
            y: 10 * game.ratioY,
            size: 17 * game.ratioX,
            isBold: true,
            angle: 0,
            zIndex: 100,
            fillStyle: '#fff',
            alpha: 0
            // width: 125 * game.ratioX,
        });
        stage.addDisplayObject(resultText);
    });

    var spritesData;
    var spritesData1;
    var boomData;
    var gameIsStart = false;

    game.increaseMeter = 1;
    game.result = 0;

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

    var bg = new ig.SpriteSheet({
        name: 'bg',
        image: 'bg',
        sheet: 'spritesData',
        sheetKey: 'bg',
        jumpFrames: 1.5, // [0.5, 1.2]
        zIndex: 1,
        // debug: 1,
        width: CONFIG.width * game.ratioX,
        height: CONFIG.height * game.ratioY
    });
    stage.addDisplayObject(bg);

    var player = new ig.SpriteSheet({
        name: 'player',
        image: 'spritesImg',
        sheet: 'spritesData',
        x: -100,
        sheetKey: 'normalRun',
        // sheetKey: 'dangerRun',
        y: 200 * game.ratioY,
        backupY: 200 * game.ratioY,
        zIndex: 10,
        jumpFrames: 4,
        runStatus: 'normal',
        // debug: 1,
    });

    player.step = function () {
        var x = player.x;
        var left = 50 * game.ratioX;
        var right = 270 * game.ratioX;
        if (x < left) {
            player.x = left;
        }
        else if (x > right) {
            player.x = right;
        }

        var bear = stage.getDisplayObjectByName('bear');
        if (bear && bear.scaleX >= '2.0') {
            gameOver();
        }
    };

    stage.addDisplayObject(player);

    /**
     * gameOver 的字样
     *
     * @return {Object} Text 对象
     */
    function gameOver() {
        stage.clearAllDisplayObject();
        stage.addDisplayObject(bg);

        gameIsStart = false;
        game.increaseMeter = 1;
        var result = parseInt(game.result, 10);
        game.result = 0;
        var maxScore = storage.getItem('maxScore') || 0;
        if (parseInt(result, 10) >= parseInt(maxScore, 10)) {
            maxScore = result;
        }
        storage.setItem('maxScore', maxScore);
        storage.setItem('curScore', parseInt(result, 10));

        var gameOverMain = stage.addDisplayObject(
            new ig.Text({
                name: 'gameOver',
                content: 'GAME OVER',
                x: (game.width - 180) / 2,
                y: (game.height - 200) / 2,
                size: 20 * game.ratioX,
                isBold: true,
                angle: 0,
                zIndex: 20,
                fillStyle: '#fff',
                scaleX: 0.01,
                scaleY: 0.01,
                width: 180,
                children: [
                    new ig.Text({
                        name: 'gameOverResult',
                        content: '当前成绩: ' + result + '米',
                        x: -20,
                        y: 50 * game.ratioY,
                        size: 15 * game.ratioX,
                        isBold: true,
                        angle: 0,
                        zIndex: 20,
                        fillStyle: '#fff',
                        width: 220,
                    }),
                    new ig.Text({
                        name: 'gameOverHistoryResult',
                        content: '历史最高: ' + maxScore + '米',
                        x: -20,
                        y: 100 * game.ratioY,
                        size: 15 * game.ratioX,
                        isBold: true,
                        angle: 0,
                        zIndex: 20,
                        fillStyle: '#fff',
                        width: 220,
                    })
                ]
            })
        );

        gameOverMain.setAnimate({
            target: {
                scaleX: 1,
                scaleY: 1,
                alpha: 1
            },
            duration: 1000,
            tween: ig.easing.easeOutBounce,
            completeFunc: function () {
                // stage.clearAllDisplayObject();
                // stage.addDisplayObject(bg);
                game.stop();

                shareNode.style.display = 'block';
                shareNode.style.bottom = '150px';
                shareNode.style.left = (game.width / 2 - 30) + 'px';

                playAgainNode.style.display = 'block';
                playAgainNode.style.bottom = '100px';
                playAgainNode.style.left = (game.width / 2 - 60) + 'px';

            }
        });
        return gameOverMain;
    }

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

        var left = 50 * game.ratioX;
        var right = 270 * game.ratioX;
        if (x >= left && x <= right) {
            player.move(dx + x, player.y);
        }
        else {
            if (x < left) {
                player.x = left;
            }
            else if (x > right) {
                player.x = right;
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
            && player.runStatus !== 'super'
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

    game.start('xiongchumoStage', function () {
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

        var t = setTimeout(function () {
            clearTimeout(t);
            guide.initGuideStep1();

            // 不要引导就直接调用下面这句
            // bear.create();
        }, 1000);
    });
};

