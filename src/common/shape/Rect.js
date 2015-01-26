/**
 * @file Description
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var Observer = require('common/observer');
    var util = require('common/util');

    function Rect(opts) {
        this.ctx = opts.ctx;
        this.frame = opts.frame;
        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.width = opts.width || 25;
        this.height = opts.height || 20;
        this.sx = opts.sx;
        this.sy = opts.sy;
        this.config = {
            fillStyle: opts.fillStyle || '#fff',
            strokeStyle: opts.strokeStyle || '#fff',
            lineWidth: opts.lineWidth || 1
        };
        this.showFlame = false;
        this.cType = opts.cType || '';
        this.updateCount = 0;
        this.stop = false;
        this.children = opts.children || [];
        this.img = opts.img || null;
    }

    Rect.prototype.update = function () {
        var me = this;
        me.fire('beforeUpdate', me);
        me.x += me.sx;
        me.y += me.sy;
        me.updateCount++;

        me.fire('afterUpdate', me);
    };

    Rect.prototype.draw = function (x, y, width, height) {
        var me = this;
        x = x || me.x;
        y = y || me.y;
        width = width || me.width;
        height = height || me.height;

        me.fire('beforeDraw', me);
        me.ctx.beginPath();
        me.ctx.lineWidth = me.config.lineWidth;
        me.ctx.fillStyle = me.config.fillStyle;
        me.ctx.strokeStyle = me.config.strokeStyle;
        me.ctx.rect(x, y, width, height);
        me.ctx.stroke();

        for (var i = 0, len = me.children.length; i < len; i++) {
            var child = me.children[i];
            if (!child.deviationX) {
                child.deviationX = Math.abs(child.x - me.x);
            }
            if (!child.deviationY) {
                child.deviationY = Math.abs(child.y - len);
            }
            child.draw(me.x + child.deviationX, child.deviationY, child.width, child.height);
            me.ctx.drawImage(child.img, me.x + child.deviationX, child.deviationY);//, me.width, me.height);
        }
        me.fire('afterDraw', me);
    };

    util.inherits(Rect, Observer);

    return Rect;

});
