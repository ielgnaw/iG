
'use strict';

/* global ig */

window.onload = function () {

    ig.loadResource(
        [
            {id: 'sound1', src: ['./data/a1.wav', './data/a1.mp3']},
            // './data/a1.mp3', './data/a1.ogg',
            // {id: 'a1m', src: './data/a1.mp3'},
            // {id: 'a1o', src: './data/a1.ogg'},
            // {id: 'a2m', src: './data/a2.mp3'},
            {id: 'a2o', src: ['./data/a2.mp3','./data/a2.ogg'], opts: {loop: true}},
            // {id: 'a3m', src: './data/a3.mp3'},
            // {id: 'a3o', src: './data/a3.ogg'},
            {id: 'a4m', src: ['./data/a4.mp3']},
            // {id: 'a4o', src: './data/a4.ogg'},
            // {id: 'a5m', src: './data/a5.mp3'},
            // {id: 'a5o', src: './data/a5.ogg'},
            // {id: 'a6m', src: './data/a6.mp3'},
            // {id: 'a6o', src: './data/a6.ogg'}
            // {id: 'blueyellow', src: ['./data/blueyellow.wav']},
            {id: 'bg', src: '/examples/img/bg.jpg'}
        ],
        function (d) {
            console.log('all don1e', d);
            // alert(ig.env.wav)
            // alert(ig.env.mp3)
            d.sound1.play()
            // alert(1)
            // safari
            // var sound = enableWebAudioSound();
            // sound.play(d.a1m, {loop: true});
            // console.warn(sound);
        }
    );

    document.querySelector('#play').addEventListener('click', function (e) {
    });


    // var BUFFERS_TO_LOAD = {
    //     a1m: './data/a1.mp3',
    //     a1o: './data/a1.ogg',
    //     a2m: './data/a2.mp3',
    //     a2o: './data/a2.ogg',
    //     a3m: './data/a3.mp3',
    //     a3o: './data/a3.ogg',
    //     a4m: './data/a4.mp3',
    //     a4o: './data/a4.ogg',
    //     a5m: './data/a5.mp3',
    //     a5o: './data/a5.ogg',
    //     a6m: './data/a6.mp3',
    //     a6o: './data/a6.ogg'
    // };

    // var sound = new Howl({
    //     urls: ['./data/a1.wav', './data/a1.ogg'],
    //     autoplay: true,
    //     loop: true,
    //     onload: function (d) {
    //         console.warn(this);
    //     }
    // })

};
