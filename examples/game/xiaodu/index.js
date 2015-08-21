/* global ig */

'use strict';

window.onload = function () {

    var util = ig.util;
    var CONFIG = ig.getConfig();
    var STATUS = CONFIG.status;
    var randomInt = util.randomInt;
    var storage = new ig.Storage();

    var canvas = document.querySelector('#canvas');
    var loadProcessNode = document.querySelector('#load-process');

    document.addEventListener('touchmove', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    var game = new ig.Game({
        canvas: canvas,
        name: 'xiaoduGame',
        maximize: 1,
        resource: [
            {id: 'meteor1', src: './img/meteor1.png'},
            {id: 'meteor2', src: './img/meteor2.png'},
            // {id: 'planet1', src: './img/planet1.png'},
            {id: 'planet1', src: './img/planet1-new.png'},
            {id: 'planet2', src: './img/planet2.png'},
            {id: 'planet3', src: './img/planet3.png'},
            {id: 'star1', src: './img/star1.png'},
            {id: 'star2', src: './img/star2.png'},
            {id: 'stage2Bg', src: './img/stage2-bg.png'},
            // {id: 'eddy1', src: './img/eddy1.png'},
            // {id: 'eddy1', src: './img/eddy1-new.png'},
            {id: 'eddy1', src: './img/eddy1-new.png'},
            {id: 'eddy2', src: './img/eddy2.png'},
            {id: 'robot', src: './img/robot.png'},
            {id: 'stage3Bg', src: './img/stage3-bg.png'},
            {id: 'sPlanet1', src: './img/planet1-small.png'},
            {id: 'bPlanet3', src: './img/planet3-big.png'},
            {id: 'earth', src: './img/earth.png'},
            {id: 'spin', src: './img/spin.png'},
            {id: 'robot2', src: './img/robot2.png'},
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
        name: 'xiaoduStage',
    });

    var BASE_Z_INDEX = 10;
    var isStart = false;

    game.start('xiaoduStage', function () {
        isStart = true;
        // stage1.init({
        // stage2.init({
        stage3.init({
        // stage4.init({
            game: game,
            stage: stage,
            baseZIndex: BASE_Z_INDEX,
            isStart: isStart
        });
    });

};

