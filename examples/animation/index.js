
'use strict';

/* global ig */
window.onload = function () {
    var Animation = ig.Animation;
    var easing = ig.easing;
    var div = document.querySelector('div');
    var am = new Animation({
        fps: 60,
        // tween: easing.easeOutBounce,
        duration: 1000,
        source: {
            // width: div.style.width
            left: div.style.left
        },
        repeat: 1,
        target: {
            left: 0
        },
        range: {
            left: -50
        }
    }).play().on('step', function (d) {
        // console.warn(d.data.source);
        div.style.left = d.data.source.left + 'px';
    });
};
