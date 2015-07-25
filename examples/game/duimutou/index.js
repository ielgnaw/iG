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

    var game = new ig.Game({
        canvas: canvas,
        name: 'duimutouGame',
        maximize: 1,
        resource: [
        ]
    }).on('loadResProcess', function (e) {
        loadProcessNode.style.display = 'block';
        loadProcessNode.style.left = (game.width / 2 - 110 / 2) + 'px';
        loadProcessNode.style.top = (game.height / 2 - 30 / 2) + 'px';
        loadProcessNode.innerHTML
            = 'loading: ' + (e.data.loadedCount / e.data.total).toFixed(1) * 100 + '%';
    }).on('loadResDone', function (e) {
    });

    var stage = game.createStage({
        name: 'duimutouStage',
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

    game.start('duimutouStage', function () {
        gameIsStart = true;
        console.warn(1);
    });
};

