/**
 * @file Description
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var $ = require('jquery');

    var Frame = require('common/Frame');
    var Rect = require('common/shape/Rect');
    var util = require('common/util');

    var canvas = document.querySelector('#canvas');
    var cWidth = canvas.width;
    var cHeight = canvas.height;
    var ctx = canvas.getContext('2d');
    var frame = new Frame(canvas);

    var scoreNode = document.querySelector('.score');

    var otherTimer;

    function addOthers(otherImgs) {
        var curOther = otherImgs[util.random(0, otherImgs.length)];
        var width = curOther.img.width;
        var height = curOther.img.height;
        var rect = new Rect({
            strokeStyle: 'rgba(0, 0, 0, 0)',
            ctx: frame.ctx,
            width: width,
            height: height,
            x: util.random(100, 1340),
            // x: 100,
            y: 0,
            sx: 0,
            sy: util.randomFloat(.9, 10),
            // sy: 1,
            frame: frame,
            cType: curOther.type,
            img: curOther.img
        });

        frame.addSprite(curOther.type + '-' + util.createGuid(), rect);

        rect.on('afterUpdate', function (data) {
            data.ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            if (frame.getSpriteByName('B')) {
                if (util.inSide(data, frame.getSpriteByName('B'), {way: 'h', value: data.height})) {
                    data.sx = 0;
                    data.sy = 0;
                    data.stop = 1;
                    frame.getSpriteByName('B').children.push(data);
                    scoreNode.innerHTML = frame.getSpriteByName('B').children.length;
                    scoreNode.className = 'score ani';
                    setTimeout(function () {
                        scoreNode.className = 'score';
                    }, 500);
                }
                else {
                    data.ctx.translate(data.x + data.width / 2, data.y + data.height / 2);
                    if (Math.abs((data.updateCount + data.x) % 360) >= 180) {
                        data.ctx.rotate(-(data.updateCount + data.x) * Math.PI / 180);
                    }
                    else {
                        data.ctx.rotate((data.updateCount + data.x) * Math.PI / 180);
                    }
                    data.ctx.translate(-data.x, -data.y);
                }
            }
            data.ctx.drawImage(curOther.img, data.x, data.y);//, data.width, data.height);
            data.ctx.restore();
        });
        rect = null;
    }

    function addMe(meImgs) {
        var curMe = meImgs[util.random(0, meImgs.length)];
        var width = curMe.img.width;
        var height = curMe.img.height;
        var rect = new Rect({
            strokeStyle: 'rgba(0, 0, 0, 0)',
            ctx: frame.ctx,
            width: width,
            height: height,
            // 左下角
            x: 0,
            y: cHeight - height,
            // 右下角
            // x: cWidth - 80,
            // y: cHeight,
            sx: 0,
            sy: 0,
            frame: frame,
            cType: curMe.type,
            img: curMe.img
        });

        frame.addSprite(curMe.type, rect);

        rect.on('afterUpdate', function (data) {
            data.ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            data.ctx.drawImage(data.img, data.x, data.y, data.img.width, data.img.height);
            data.ctx.restore();

            if (data.x > cWidth - data.width // 右边界
                || data.x < 0 // 左边界
            ) {
                data.sx = -data.sx;
            }

        });
        rect = null;
    }

    function mousedownFunc(e) {
        e.stopPropagation();
        e.preventDefault();
        var x = e.x || e.pageX;
        var y = e.y || e.pageY;
        var me = frame.getSpriteByName('B');
        var isInRect = util.containsPoint(
            {
                x: me.x,
                y: me.y,
                width: me.width,
                height: me.height
            },
            util.windowToCanvas(canvas, x,y).x,
            util.windowToCanvas(canvas, x,y).y
        );
        if (isInRect) {
            canvas.style.cursor = 'move';
            canvas.addEventListener('mousemove', mousemoveFunc, false);
            canvas.addEventListener('touchmove', mousemoveFunc, false);
            canvas.addEventListener('mouseup', mouseupFunc, false);
            canvas.addEventListener('touchend', mouseupFunc, false);
        }
        else {
            canvas.style.cursor = 'default';
        }
    }

    function mousemoveFunc(e) {
        e.stopPropagation();
        e.preventDefault();
        var x = e.x || e.pageX;
        var y = e.y || e.pageY;
        var me = frame.getSpriteByName('B');
        if (x - 50 <= cWidth - 150 // 右边界
            && x - 50 >= 0 // 左边界
        ) {
            me.x = x - 50;
        }
    }

    function mouseupFunc(e) {
        e.stopPropagation();
        e.preventDefault();
        var x = e.x || e.pageX;
        var y = e.y || e.pageY;
        var me = frame.getSpriteByName('B');
        canvas.style.cursor = 'default';
        canvas.removeEventListener('touchmove', mousemoveFunc, false);
    }

    var exports = {};
    exports.init = function (imgs, callback) {

        var otherImgs = [];
        var meImgs = [];
        for (var i = 0, len = imgs.length; i < len; i++) {
            if (imgs[i].type === 'A') {
                otherImgs.push(imgs[i]);
            }
            else if (imgs[i].type === 'B') {
                meImgs.push(imgs[i]);
            }
        }

        otherTimer = setInterval(
            (function (ois) {
                return function () {
                    addOthers(ois);
                }
            })(otherImgs),
            1000
        );

        addOthers(otherImgs);
        addMe(meImgs);

        canvas.addEventListener('mousedown', mousedownFunc, false);
        canvas.addEventListener('touchstart', mousedownFunc, false);

        frame.start();

        callback();
    };

    exports.dispose = function () {
        clearInterval(otherTimer);
        frame.stop();
    };

    return exports;

});
