
'use strict';

/* global ig */
window.onload = function () {
    var Animation = ig.Animation;
    var easing = ig.easing;
    var util = ig.util;
    var div = document.querySelector('#target');
    var width = div.style.width;
    var left = div.style.left;
    var height = div.style.height;
    var opacity = div.style.opacity;

    var anim;

    document.querySelector('.control').onclick = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var target = e.target || e.srcElement;

        var opts = {
            fps: 60,
            duration: 1000,
            source: {
                width: width,
                left: left,
                height: height,
                opacity: opacity
            }
        };

        var isStop = true;

        if (target.tagName.toLowerCase() === 'a') {
            var type = target.getAttribute('data');

            if (type !== 'toggle') {
                switch (type) {
                    case 'simple':
                        if (anim) {
                            anim.destroy();
                        }
                        util.extend(opts, {
                            target: {
                                left: 300,
                                width: 150,
                                height: 200,
                                opacity: 0.3
                            }
                        });
                        break;
                    case 'simpleRepeat':
                        if (anim) {
                            anim.destroy();
                        }
                        util.extend(opts, {
                            repeat: 1,
                            target: {
                                left: 300,
                                width: 150,
                                height: 200,
                                opacity: 0.3
                            }
                        });
                        break;
                    case 'anims':
                        if (anim) {
                            anim.destroy();
                        }
                        util.extend(opts, {
                            target: [
                                {
                                    left: 300,
                                    width: 150,
                                },
                                {
                                    height: 200,
                                    opacity: 0.3
                                }
                            ]
                        });
                        break;
                    case 'animsRepeat':
                        if (anim) {
                            anim.destroy();
                        }
                        util.extend(opts, {
                            repeat: 1,
                            target: [
                                {
                                    left: 300,
                                    width: 150,
                                },
                                {
                                    height: 200,
                                    opacity: 0.3
                                }
                            ]
                        });
                        break;
                    case 'range':
                        if (anim) {
                            anim.destroy();
                        }
                        util.extend(opts, {
                            range: {
                                left: 100,
                                width: 40
                            }
                        });
                        break;
                    case 'rangeRepeat':
                        if (anim) {
                            anim.destroy();
                        }
                        util.extend(opts, {
                            repeat: 1,
                            range: {
                                left: 100,
                                width: 40
                            }
                        });
                        break;
                    default:
                }

                anim = new Animation(opts).play().on('step', function (d) {
                    div.style.left = d.data.source.left + 'px';
                    div.style.width = d.data.source.width + 'px';
                    div.style.height = d.data.source.height + 'px';
                    div.style.opacity = d.data.source.opacity;
                }).on('repeat', function (d) {
                    console.warn('repeat');
                }).on('groupComplete', function (d) {
                    console.warn('groupComplete');
                }).on('complete', function (d) {
                    console.warn('all complete');
                });
            }
            else {
                if (anim) {
                    anim.togglePause();
                    // anim.pause();
                    // setTimeout(function () {
                    //     anim.resume();
                    // }, 4000);
                }
            }
        }
    };
};
