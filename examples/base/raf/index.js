'use strict';

/* global ig */

window.onload = function () {
    var handler;
    document.querySelector('#start').addEventListener('click', function (e) {
        ig.clearRaf(handler);
        handler = ig.rafInterval(function (realDelta, realFps) {
            document.querySelector('#fps').innerHTML = Math.floor(1000 / (realDelta));
        }, document.querySelector('#f').value);
    });

    var q = ig.rafInterval(function (delta, realDelta, realFps) {
        console.warn(delta, realDelta, realFps);
    }, 2000);
    // setInterval(function (realDelta, realFps) {
    //     console.warn(q);
    // }, 2000);

    // ig.rafInterval(function (delta, realDelta, realFps) {
    // }, 200);
    // ig.rafInterval(function (delta, realDelta, realFps) {
    // }, 200);
    // ig.rafInterval(function (delta, realDelta, realFps) {
    //     console.warn(q);
    // }, 2000);

    var q1 = ig.rafTimeout(function (delta, realDelta, realFps) {
        console.warn(delta, realDelta, realFps);
    }, 2000);

    var q2 = ig.rafInterval(function (delta, realDelta, realFps) {
        console.warn(delta, realDelta, realFps);
    }, 1000);

    setTimeout(function () {
        console.warn('over');
        ig.clearRaf(q);
    }, 6000);
}
