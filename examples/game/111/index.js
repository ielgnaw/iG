/* global ig */

'use strict';

window.onload = function () {

    document.addEventListener('touchmove', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    var util = ig.util;
    var CONFIG = ig.getConfig();
    var STATUS = CONFIG.status;
    var canvas = document.querySelector('#canvas');
    var loadProcessNode = document.querySelector('#load-process');
    var shareNode = document.querySelector('.share');
    var playAgainNode = document.querySelector('.play-again');
    var shareContainerNode = document.querySelector('.share-container');
    var storage = new ig.Storage();

    var countdownTimer = '20';
    var countdownNode = document.querySelector('.time');
    countdownNode.innerHTML = countdownTimer + '秒';

    var scoreNode = document.querySelector('.score');

    var againNode = document.querySelector('.game-again');

    againNode.addEventListener('click', startGame);

    var gameIsStart = false;

    var game = new ig.Game({
        canvas: canvas,
        name: 'demoGame',
        maximize: 1,
        resource: [
            // {id: 'playerImg', src: './img/player.png'},
            // {id: 'playerData', src: './data/player.json'},
            {id: 'normalPlayer', src: './img/normal-player.png'},
            {id: 'rightPlayer', src: './img/right-player.png'},
            {id: 'wrongPlayer', src: './img/wrong-player.png'},
            {id: 'right1', src: './img/right1.png'},
            {id: 'right2', src: './img/right2.png'},
            {id: 'right3', src: './img/right3.png'},
            {id: 'teacher1', src: './img/teacher1.png'},
            {id: 'teacher2', src: './img/teacher2.png'},
            {id: 'scoreEffect', src: './img/score-effect.png'},
        ]
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
        bgColor: '#ff4a39',
        captureFunc: function (e) {
            stageCaptureFunc.call(this, e);
        },
        moveFunc: function (e) {
            stageMoveFunc.call(this, e);
        }
    });

    var playerWidth = 85;
    var playerHeight = 114; // 错误的时候 player 高度是 100

    var teacherWidth = 78;
    var teacherHeight = 94;

    var rightWidth = 46;
    var rightHeight = 57;

    var player;

    function createPlayer() {
        var player = stage.addDisplayObject(
            new ig.Bitmap({
                name: 'player',
                asset: game.asset.normalPlayer,
                x: (game.width - playerWidth) / 2,
                y: game.height - playerHeight,
                mouseEnable: true,
                zIndex: 10
            })
        );

        player.step = function () {
            var x = player.x;
            var left = 0;
            var right = game.width;
            if (x < left) {
                player.x = left;
            }
            else if (x > right) {
                player.x = right;
            }
        };

        return player;
    }

    function createTeacher() {
        var teacher = stage.addDisplayObject(
            new ig.Bitmap({
                name: 'teacher_' + Date.now(),
                asset: game.asset['teacher' + util.randomInt(1, 2)],
                x: util.randomInt(0, game.width - teacherWidth),
                y: 0,
                vy: util.randomInt(2, 7)
            })
        );

        teacher.step = function (dt, stepCount, requestID) {
            this.vx += this.ax * dt;
            this.vx *= this.frictionX * dt;
            this.vy += this.ay * dt;
            this.vy *= this.frictionY * dt;

            this.x += this.vx * dt;
            this.y += this.vy * dt;

            if (this.collidesWith(player) && !player.isCollide) {
                player.change({
                    asset: game.asset.wrongPlayer,
                    y: player.y - 12,
                    height: player.height + 12,
                    sHeight: player.sHeight + 12
                });
                player.isCollide = true;

                createScoreEffect('得分-10', player.x, player.y);

                var curScore = parseInt(scoreNode.innerHTML, 10);
                scoreNode.innerHTML = parseInt(curScore - 10, 10);

                player.setAnimate({
                    target: {
                        alpha: 0
                    },
                    repeat: 1,
                    duration: 200,
                    repeatFunc: function (e) {
                        if (e.data.repeatCount === 2) {
                            e.target.stop();
                            e.target.paused = false;
                            player.change({
                                asset: game.asset.normalPlayer,
                                // debug: 1,
                                y: player.y + 12,
                                height: player.height - 12,
                                sHeight: player.sHeight - 12
                            });
                            player.isCollide = false;
                        }
                    }
                });

                this.setAnimate({
                    target: {
                        alpha: 0,
                        scaleX: 0,
                        scaleY: 0
                    },
                    duration: 300,
                    completeFunc: function (e) {
                        e.data.source.setStatus(STATUS.DESTROYED);
                    }
                });
            }

            if (this.y > game.height - this.height) {
                this.vy = 0;
                this.setStatus(STATUS.DESTROYED);
            }
        };
    }

    function createRight() {
        var right = stage.addDisplayObject(
            new ig.Bitmap({
                name: 'right_' + Date.now(),
                asset: game.asset['right' + util.randomInt(1, 3)],
                x: util.randomInt(0, game.width - rightWidth),
                y: 0,
                vy: util.randomInt(2, 7)
            })
        );

        right.step = function (dt, stepCount, requestID) {
            this.vx += this.ax * dt;
            this.vx *= this.frictionX * dt;
            this.vy += this.ay * dt;
            this.vy *= this.frictionY * dt;

            this.x += this.vx * dt;
            this.y += this.vy * dt;

            if (this.collidesWith(player) && !player.isCollide) {
                player.change({
                    asset: game.asset.rightPlayer
                });
                player.isCollide = true;

                var score = [5, 10][util.randomInt(0, 1)];
                createScoreEffect('得分+' + score, player.x, player.y);

                var curScore = parseInt(scoreNode.innerHTML, 10);
                scoreNode.innerHTML = parseInt(curScore + score, 10);

                this.setAnimate({
                    target: {
                        alpha: 0,
                        scaleX: 0,
                        scaleY: 0
                    },
                    duration: 100,
                    completeFunc: function (e) {
                        e.data.source.setStatus(STATUS.DESTROYED);
                        player.change({
                            asset: game.asset.normalPlayer
                        });
                        player.isCollide = false;
                    }
                });
            }

            if (this.y > game.height - this.height) {
                this.vy = 0;
                this.setStatus(STATUS.DESTROYED);
            }
        };
    }

    function createScoreEffect(content, x, y) {
        content = content || '';
        var score = new ig.Text({
            name: 'score_' + Date.now(),
            content: content,
            x: 20,
            y: 20,
            size: 13,
            isBold: true,
            zIndex: 10,
            fillStyle: '#ffec00',
            // followParent: 1,
            useCache: false
        });

        var right = stage.addDisplayObject(
            new ig.Bitmap({
                name: 'scoreEffect_' + Date.now(),
                asset: game.asset.scoreEffect,
                x: x - 10, // game.width / 2,
                y: y - 54, // game.height - 200,
                children: [score],
                scaleX: 0,
                scaleY: 0
            })
        );

        right.setAnimate({
            target: {
                // y: right.y - 100,
                scaleX: 1.5,
                scaleY: 1.5,
            },
            duration: 1000,
            tween: ig.easing.easeOutBounce,
            completeFunc: function (e) {
                e.data.source.setStatus(STATUS.DESTROYED);
            }
        })
    }

    var captureX;

    /**
     * stage capture 回调事件
     */
    function stageCaptureFunc(e) {
        if (!gameIsStart || game.paused) {
            return;
        }
        captureX = e.x;
    }

    /**
     * stage move 回调事件
     */
    function stageMoveFunc(e) {
        if (!gameIsStart || game.paused) {
            return;
        }

        var x = player.x;
        var dx = e.x - captureX;

        captureX = e.x;

        var left = 0; // 50 * game.ratioX;
        var right = game.width - 75; // 270 * game.ratioX;
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
    }

    function gameEnd() {
        console.warn('gameEnd');
    }

    function startGame() {
        againNode.style.display = 'none';
        game.start('demoStage', function () {
            document.querySelector('.panel').style.display = 'block';
            player = createPlayer();
            gameIsStart = true;
            var countdown = parseFloat(countdownNode.innerHTML);

            ig.loop({
                step: function (dt, stepCount, requestID) {
                    if (!gameIsStart) {
                        window.cancelAnimationFrame(requestID);
                    }
                },
                exec: function (execCount) {
                    var displayList = stage.getDisplayObjectList();
                    var rightCount = 0;
                    var teacherCount = 0;
                    for (var i = 0, len = displayList.length; i < len; i++) {
                        if (displayList[i].name.slice(0, 5) === 'right') {
                            rightCount++;
                        }

                        if (displayList[i].name.slice(0, 7) === 'teacher') {
                            teacherCount++;
                        }
                    }

                    if (rightCount <= 5) {
                        createRight();
                    }

                    if (teacherCount <= 3) {
                        createTeacher();
                    }

                },
                jumpFrames: 50
            });

            ig.loop({
                step: function (dt, stepCount, requestID) {
                    if (countdown <= 0) {
                        game.stop();
                        gameIsStart = false;
                        window.cancelAnimationFrame(requestID);
                        countdownNode.innerHTML = countdownTimer + '秒';
                        scoreNode.innerHTML = 0;
                        stage.clearAllDisplayObject();

                        againNode.style.display = 'block';

                        gameEnd();
                        return;
                    }
                    if (stepCount % 10 === 0) {
                        countdown = (countdown - 0.1).toFixed(1);
                        countdownNode.innerHTML = countdown + '秒';
                    }
                }
            });

        });
    }

    startGame();
};

