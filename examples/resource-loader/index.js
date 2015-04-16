
'use strict';

/* global ig */

window.onload = function () {
    document.querySelector('a').onclick = function (e) {
        e.stopPropagation();
        e.preventDefault();
        ig.loadResource(
            [
                '/examples/img/1.jpg',
                {
                    id: 'bg',
                    src: '/examples/img/bg.jpg'
                },
                {
                    id: 'jsonData',
                    src: './data/test.json'
                },
                {
                    id: 'textData',
                    src: './data/text.text'
                }
            ],
            function (d) {
                console.log('all done', d);
            },
            {
                processCallback: function (d) {
                    console.warn('process', d);
                }
            }
        );

        ig.loadImage('a', '/examples/img/bg4.jpg', function (d) {console.log('callback', d)}, function (d) {console.log('errorCallback', d)});
        ig.loadImage('/examples/img/bg4.jpg', function (d) {console.log('callback', d)}, function (d) {console.log('errorCallback', d)});
        ig.loadImage('/examples/img/bg4.jpg', function (d) {console.log('callback', d)}, function (d) {console.log('errorCallback', d)});
        ig.loadImage('/examples/img/bg4.jpg', function (d) {console.log('callback', d)});
        ig.loadImage('/examples/img/bg4.jpg');
    }
};
