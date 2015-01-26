/**
 * @file Description
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var Observer = require('common/observer');
    var util = require('common/util');

    function Circle(opts) {
        this.ctx = opts.ctx;
        this.frame = opts.frame;
        this.x = opts.x;
        this.y = opts.y;
        this.sx = opts.sx;
        this.sy = opts.sy;
        this.radius = opts.radius;
        this.endPoint = opts.endPoint || {};
        this.config = {
            fillStyle: opts.fillStyle || '#fff',
            lineWidth: opts.lineWidth || 1
        };
        this.cType = opts.cType || '';
        this.updateCount = 0;
        this.stop = false;
    }

    // Circle.prototype = Observer.prototype;

    Circle.prototype.constructor = Circle;

    Circle.prototype.update = function () {
        var me = this;
        me.fire('beforeUpdate', me);
        me.x += me.sx;
        me.y += me.sy;
        me.updateCount++;

        me.fire('afterUpdate', me);
    }

    Circle.prototype.draw = function () {
        var me = this;
        me.fire('beforeDraw', me);
        me.ctx.beginPath();
        me.ctx.lineWidth = me.config.lineWidth;
        me.ctx.fillStyle = me.config.fillStyle;
        me.ctx.arc(me.x, me.y, me.radius, 0, Math.PI * 2, true);
        me.ctx.fill();
        me.fire('afterDraw', me);
    };

    util.inherits(Circle, Observer);

    return Circle;

});
