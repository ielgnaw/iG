/**
 * @file example1
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var Frame = require('common/Frame');
    var Circle = require('common/shape/Circle');
    var Rect = require('common/shape/Rect');
    var util = require('common/util');

    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');

    var cWidth;
    var cHeight;
    var frame;

    var YUANBAO_IMG;
    var WAN_IMG;

    var interval;

    var scoreNode = document.querySelector('.score');

    function setWH() {
        canvas.setAttribute('width', util.pageSize.page.w);
        canvas.setAttribute('height', util.pageSize.page.h);

        cWidth = canvas.width;
        cHeight = canvas.height;
        frame = new Frame(canvas);
    }

    function addYb() {
        var yuanbaoWidth = 50;
        var yuanbaoHeight = 36;
        var yuanbao = new Rect({
            strokeStyle: 'rgba(0, 0, 0, 0)',
            ctx: frame.ctx,
            width: yuanbaoWidth,
            height: yuanbaoHeight,
            x: util.random(100, 1340),
            // x: 100,
            y: 0,
            sx: 0,
            sy: util.randomFloat(.9, 10),
            // sy: 1,
            frame: frame,
            endPoint: {
                x: cWidth / 2,
                y: cHeight / 2
            },
            cType: 'yuanbao',
            img: YUANBAO_IMG
        });

        frame.addSprite('yuanbao-' + util.createGuid(), yuanbao);

        yuanbao.on('afterUpdate', function (data) {
            data.ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            if (util.inSide(data, frame.getSpriteByName('wan'), {way: 'h', value: data.height})) {
                data.sx = 0;
                data.sy = 0;
                data.stop = 1;
                frame.getSpriteByName('wan').children.push(data);
                scoreNode.innerHTML = frame.getSpriteByName('wan').children.length;
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
            data.ctx.drawImage(YUANBAO_IMG, data.x, data.y);//, data.width, data.height);
            data.ctx.restore();
        });

        yuanbao = null;
    }

    function imgLoaded() {
        addYb();
        interval = setInterval(addYb, 1000);
    }

    var wanScale = 1;
    function wanLoaded() {
        var wanHeight = 90;
        var wanWidth = 150;
        var wan = new Rect({
            strokeStyle: 'rgba(0, 0, 0, 0)',
            ctx: frame.ctx,
            width: wanWidth,
            height: wanHeight,

            // 左下角
            x: 0,
            y: cHeight - wanHeight,

            // 右下角
            // x: cWidth - 80,
            // y: cHeight,
            sx: 0,
            sy: 0,
            frame: frame,
            endPoint: {
                x: cWidth / 2,
                y: cHeight / 2
            },
            cType: 'wan'
        });
        wan.on('afterUpdate', function (data) {
            // data.width = data.width * wanScale;
            // data.height = data.height * wanScale;
            data.ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            data.ctx.drawImage(WAN_IMG, data.x, data.y, WAN_IMG.width * wanScale, WAN_IMG.height * wanScale);
            data.ctx.restore();

            if (data.x > cWidth - wanWidth // 右边界
                || data.x < 0 // 左边界
            ) {
                data.sx = -data.sx;
            }

            if (!checkYuanbao()) {
                frame.stop();
                clearInterval(interval);
            }
        });

        frame.addSprite('wan', wan);
        frame.start();
    }

    function checkYuanbao() {
        var allSprites = frame.getAllSprites();
        var hasYb = false;
        for (var i in allSprites) {
            if (allSprites[i].cType === 'yuanbao') {
                hasYb = true;
                break;
            }
        }
        return hasYb;
    }

    var exports = {};

    exports.init = function () {
        setWH();
        YUANBAO_IMG = new Image();
        // YUANBAO_IMG.addEventListener('load', imgLoaded, false);
        YUANBAO_IMG.src = require.toUrl('../../img/jinyuanbao.png');

        WAN_IMG = new Image();
        // WAN_IMG.addEventListener('load', wanLoaded, false);
        WAN_IMG.src = require.toUrl('../../img/wan.png');

        document.querySelector('.start').addEventListener('click', startFunc, false);
        // document.querySelector('.stop').addEventListener('click', stopFunc, false);
    };

    function startFunc(e) {
        e.stopPropagation();
        e.preventDefault();
        scoreNode.innerHTML = 0;
        scoreNode.className = 'score';

        canvas.setAttribute('width', cWidth);
        canvas.setAttribute('height', cHeight);

        imgLoaded();
        wanLoaded();

        window.addEventListener('mousedown', mousedownFunc, false);
        document.querySelector('.stop').addEventListener('click', stopFunc, false);
        document.querySelector('.start').removeEventListener('click', startFunc, false);
    }

    function stopFunc(e) {
        e.stopPropagation();
        e.preventDefault();
        frame && frame.stop();
        clearInterval(interval);
        document.querySelector('.start').addEventListener('click', startFunc, false);
        document.querySelector('.stop').removeEventListener('click', stopFunc, false);
    }

    function mousedownFunc(e) {
        e.stopPropagation();
        e.preventDefault();
        var x = e.x || e.pageX;
        var y = e.y || e.pageY;
        var wan = frame.getSpriteByName('wan');
        var isInRect = util.containsPoint(
            {
                x: wan.x,
                y: wan.y,
                width: wan.width,
                height: wan.height
            },
            util.windowToCanvas(canvas, x,y).x,
            util.windowToCanvas(canvas, x,y).y
        );
        if (isInRect) {
            canvas.style.cursor = 'move';
            window.addEventListener('mousemove', mousemoveFunc, false);
            window.addEventListener('mouseup', mouseupFunc, false);
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
        var wan = frame.getSpriteByName('wan');
        if (x - 50 <= cWidth - 150 // 右边界
            && x - 50 >= 0 // 左边界
        ) {
            wan.x = x - 50;
        }
    }

    function mouseupFunc(e) {
        e.stopPropagation();
        e.preventDefault();
        var x = e.x || e.pageX;
        var y = e.y || e.pageY;
        var wan = frame.getSpriteByName('wan');
        canvas.style.cursor = 'default';
        window.removeEventListener('mousemove', mousemoveFunc, false);
    }

    return exports;

});
