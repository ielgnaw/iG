
'use strict';

/* global ig */

window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');

    var game1 = new ig.Game({
        canvas: canvas,
        name: 'test-game1',
        maximize: 1,
        resource: [
            // {id: 'bg', src: '/examples/img/base/bg.jpg'},
            // {id: 'bg1', src: '/examples/img/base/bg1.png'},
            // {id: 'bg2', src: '/examples/img/base/bg2.png'},
            // {id: 'bg3', src: '/examples/img/base/bg3.png'},
            {id: 'spriteSheetImg', src: '/examples/img/base/sprite-sheet1.png'},
            {id: 'spriteSheetImg2', src: '/examples/img/base/sprite-sheet2.jpg'},
            // {id: 'test2', src: '/examples/img/base/2.png'},
            {id: 'spriteSheetData', src: './data/sprite-sheet1.json'},
            {id: 'spriteSheetData2', src: './data/sprite-sheet2.json'},
            // {id: 'text', src: './data/text.text'},
            // {id: 'a2o', src: ['./data/a2.mp3','./data/a2.ogg'], opts: {loop: true}},
            // '/examples/img/base/boom.png'
        ]
    }).on('loadResProcess', function (e) {
        document.querySelector('#load-process').innerHTML
            = 'loadProcess: ' + (e.data.loadedCount / e.data.total).toFixed(1) * 100 + '%'
    }).on('loadResDone', function (e) {
    });

    var stage1 = game1.createStage({
        name: 'stage-name1',
        // parallaxOpts: [
        //     {
        //         image: 'bg',
        //         anims: [
        //             {
        //                 ax: 1,
        //                 ay: 1
        //             },
        //             {
        //                 ax: -1,
        //                 ay: 1
        //             }
        //         ],
        //         animInterval: 100
        //     }
        // ],
        captureFunc: function (e) {
            console.warn(spritesheet1.hitTestPoint(e.x, e.y));
        }
    });

    var spritesheet1 = stage1.addDisplayObject(
        new ig.SpriteSheet({
            name: 'spritesheet1',
            // image: '/examples/img/base/sprite-sheet1.png',
            // image: 'spriteSheetImg',
            // sheet: 'spriteSheetData',
            // sheet: './data/sprite-sheet1.json',
            // sheetKey: 'red',

            image: 'spriteSheetImg2',
            sheet: './data/sprite-sheet2.json',
            jumpFrames: 5,
            x: 150,
            y: 150,
            debug: 1,
            // width: 100,
            // height: 200,
            moveFunc: function (d) {
                d.domEvent.preventDefault();
                this.move(d.x, d.y);
            },
            // useCache: false
        })
    );
    spritesheet1.step = function (dt, stepCount) {
        this.angle += 1;
    };

    setTimeout(function () {
        // spritesheet1.changeFrame();
        spritesheet1.changeFrame(
            // ig.util.extend(true, {}, game1.asset.spriteSheetData.redCapture, {x: 20, y: 30})
            ig.util.extend(true, {
                asset: game1.asset.spriteSheetImg,
                isOnce: true,
                onceDone: function () {
                    // console.warn(arguments, 'onceDone');
                }
            }, game1.asset.spriteSheetData.red)
        );
    }, 3000);

    // var text1 = stage1.addDisplayObject(
    //     new ig.Text({
    //         name: 'text1',
    //         content: 'oh no....',
    //         x: 200,
    //         y: 400,
    //         // scaleX: 0.5,
    //         // scaleY: 0.5,
    //         size: 20,
    //         isBold: true,
    //         angle: 0,
    //         debug: 1,
    //         zIndex: 100,
    //         fillStyle: '#f00',
    //         moveFunc: function (d) {
    //             // console.warn(d);
    //             this.move(d.x, d.y);
    //         },
    //         // useCache: false
    //     })
    // );

    // text1.step = function (dt, stepCount) {
    //     this.angle += 1;
    // };

    game1.start('asdda', function () {
        console.warn('startCallback');
        console.warn(stage1);
    }).on('gameFPS', function (e) {
        // console.warn(e.data.fps);
        document.querySelector('#fps').innerHTML = 'fps: ' + e.data.fps;
    });

};
