
'use strict';

/* global ig */
window.onload = function () {
    var Animation = ig.Animation;
    var easing = ig.easing;
    var div = document.querySelector('div');
    var am = new Animation({
        // name: 'asdasd',
        fps: 60,
        // tween: easing.easeOutBounce,
        duration: 1000,
        source: {
            width: div.style.width,
            left: div.style.left,
            height: div.style.height,
            opacity: div.style.opacity
        },
        repeat: 1,
        // target: {
        //     left: 0,
        //     width: 150,
        //     // height: 200,
        //     // opacity: 0.3
        // },
        // target: [
        //     {
        //         left: 0,
        //         width: 150,
        //     },
        //     {
        //         height: 200,
        //         opacity: 0.3
        //     }
        // ],
        range: {
            left: 50
        }
    }).play().on('step', function (d) {
        // console.warn(d.data.source);
        div.style.left = d.data.source.left + 'px';
        div.style.width = d.data.source.width + 'px';
        div.style.height = d.data.source.height + 'px';
        div.style.opacity = d.data.source.opacity;
    }).on('groupComplete', function (d) {
        console.warn('groupComplete');
    }).on('complete', function (d) {
        console.warn('all complete');
    });

    // console.warn(am);
    // setTimeout(function () {
    //     am.stop();
    // }, 5000);
};
