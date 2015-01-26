/**
 * @file 帧对象，将需要在这一帧上显示的图形画在 canvas 上
 * 每隔一段时间重画自己一次，每到一定时间清除 canvas ，然后调用当前帧里所有
 * 动画元素的 draw 方法
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var util = require('common/util');

    function Frame(canvas) {
        this.sprites = {};
        this.canvas = canvas;
        this.cWidth = canvas.width;
        this.cHeight = canvas.height;
        this.ctx = canvas.getContext('2d');
    }

    Frame.prototype.start = function () {
        var me = this;
        me.render();
    };

    Frame.prototype.render = function () {
        var me = this;

        me.interval = window.requestAnimationFrame(
            (function (context) {
                return function () {
                    context.render();
                }
            })(me)
        );

        me.ctx.clearRect(0, 0, me.cWidth, me.cHeight);

        // 创建追踪效果
        // 设定 globalCompositeOperation 为 destination-out 可以在特定的不透明度来清除 canvas ，而不是完全擦拭
        // me.ctx.globalCompositeOperation = 'destination-out';
        // // 降低 alpha 属性可以创建更好的路径效果
        // me.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        // me.ctx.fillRect(0, 0, me.cWidth, me.cHeight);
        // me.ctx.globalCompositeOperation = 'destination-over';
        // debugger
        for (var i in me.sprites) {
            // debugger
            var sprite = me.sprites[i];
            if (sprite && !sprite.stop) {
                sprite.draw();
                sprite.update();

                if (sprite.x < 0 || sprite.x > me.cWidth
                    || sprite.y < 0 || sprite.y > me.cHeight
                ) {
                    me.removeSprite(i);
                }
            }
        }
    }

    Frame.prototype.addSprite = function (name, sprite) {
        this.sprites[name] = sprite;
    };

    Frame.prototype.removeSprite = function (name) {
        delete this.sprites[name];
    };

    Frame.prototype.removeAllSprite = function () {
        this.sprites = {};
    };

    Frame.prototype.getAllSprites = function () {
        return this.sprites;
    };

    Frame.prototype.getSpriteByName = function (name) {
        return this.sprites[name];
    };

    Frame.prototype.stop = function () {
        var me = this;
        window.cancelAnimationFrame(me.interval);
    };

    return Frame;

});
