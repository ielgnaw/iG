
'use strict';

/* global ig */

window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var fpsNode = document.querySelector('#fps');
    var game = new ig.Game(
        {
            canvas: canvas,
            name: 'fps-test-game',
            fps: 50,
            maximize: 1,
            // horizontalPageScroll: 100
        }
    ).start(function () {
        console.warn('start callback');
    }).on('beforeGameRender', function (d) {
        // console.warn('beforeGameRender', d);
    }).on('afterGameRender', function (d) {
        // console.warn('afterGameRender', d);
    }).on('gameFPS', function (d) {
        fpsNode.innerHTML = 'fps: ' + d.data.fps;
    });
    console.warn(game);
};
