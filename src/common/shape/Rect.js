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
    }

    // Rect.prototype = require('common/observer').prototype;
    // Rect.prototype.constructor = Rect;

    Rect.prototype.update = function () {
        var me = this;
        me.fire('beforeUpdate', me);
        me.x += me.sx;
        me.y += me.sy;
        me.updateCount++;

        me.fire('afterUpdate', me);
    };

    Rect.prototype.draw = function () {
        var me = this;
        me.fire('beforeDraw', me);
        me.ctx.beginPath();
        me.ctx.lineWidth = me.config.lineWidth;
        me.ctx.fillStyle = me.config.fillStyle;
        me.ctx.strokeStyle = me.config.strokeStyle;
        me.ctx.rect(me.x, me.y, me.width, me.height);
        me.ctx.stroke();
        me.fire('afterDraw', me);
    };

    util.inherits(Rect, Observer);

    return Rect;

});
