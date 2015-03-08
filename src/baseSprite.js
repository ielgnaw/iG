/**
 * @file 所有显示在游戏中的对象的基类，包括精灵、精灵表、场景等等
 * @author ielgnaw(wuji0223@gmail.com)
 */

(function (root, ig, undefined) {

    /**
     * 绘制 debug 用的矩形
     *
     * @param {Object} ctx canvas 2d 上下文对象
     */
    function _drawDebugRect(ctx) {
        var me = this;
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#fff';
        ctx.globalAlpha = 0.8;
        ctx.rect(me.x, me.y, me.width, me.height);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    /**
     * 精灵基类
     * @constructor
     *
     * @param {Object} opts 参数
     */
    function BaseSprite(opts) {
        opts = opts || {};

        var me = this;

        // 横坐标
        me.x = opts.x || 0;

        // 纵坐标
        me.y = opts.y || 0;

        // 宽
        me.width = opts.width || 20;

        // 长
        me.height = opts.height || 20;

        // 横轴速度，x += vX
        me.vX = opts.vX || 0;

        // 纵轴速度，y += vY
        me.vY = opts.vY || 0; // 纵轴速度

        // 横轴加速度，vX += aX
        me.aX = opts.aX || 0;

        // 纵轴加速度，vY += aY
        me.aY = opts.aY || 0;

        // 横轴相反，为 true 即代表横轴的速度相反，vX = -vX
        me.reverseX = false;

        // 纵轴相反，为 true 即代表纵轴的速度相反，vY = -vY
        me.reverseY = false;

        // 透明度
        me.alpha = opts.alpha || 1;

        // 缩放倍数
        me.scale = opts.scale || 1;

        // 旋转角度，这里使用的是角度，canvas 使用的是弧度
        me.angle = opt.angle || 0;

        // 半径，矩形也可以有半径，这时半径是为了当前矩形做圆周运动的辅助
        me.radius = Math.random() * 30;

        // 当前 sprite 的状态
        // 1: 每帧需要更新，各种状态都正常
        // 0: 不需要更新，但还是保存在整体的 sprite 集合中
        // -1: 已经销毁，不需要更新，也不在整体的 sprite 集合中了
        me.status = 1;

        // 自定义的属性
        me.customProp = {};

        // 当前这个 sprite 是否开启 debug 模式
        // 开始 debug 模式即绘制这个 sprite 的时候会带上边框
        me.debug = false;
    }

    /**
     * 和另一个 sprite 是否发生碰撞
     *
     * @param {Object} otherSprite 另一个 sprite
     *
     * @return {boolean} 是否碰撞结果
     */
    BaseSprite.prototype.isHit = function (otherSprite) {
        var me = this;

        var minX = me.x > otherSprite.x ? me.x : otherSprite.x;
        var maxX = me.x + me.width < otherSprite.x + otherSprite.width
                    ? me.x + me.width : otherSprite.x + otherSprite.width;

        var minY = me.y > otherSprite.y ? me.y : otherSprite.y;
        var maxY = me.y + me.width < otherSprite.y + otherSprite.width
                    ? me.y + me.width : otherSprite.y + otherSprite.width;

        return minX <= maxX && minY <= maxY;
    };

    /**
     * 绘制 sprite
     *
     * @param {Object} ctx canvas 2d 上下文对象
     */
    BaseSprite.prototype.draw = function (ctx) {
        var me = this;
        me.update(ctx);

        ctx.save();
        ctx.globalAlpha = me.alpha;
        ctx.rotate(me.rotation * Math.PI / 180);
        ctx.translate(me.x * me.scale, me.y * me.scale);
        me.fire('BaseSprite:draw', me);
        if (me.debug) {
            _drawDebugRect.call(me, ctx);
        };
        ctx.restore();
    };

    // BaseSprite.prototype.draw = function (ctx) {
    //     var me = this;
    //     me.update(screen);
    //     ctx.save();
    //     ctx.globalAlpha = me.alpha;
    //     ctx.rotate(me.rotation * Math.PI / 180);
    //     ctx.translate(me.offsetX * me.scale, me.offsetY * me.scale);
    //     me._draw(screen);
    //     me.debugRect(screen);
    //     ctx.restore();
    // }

    ig.inherits(BaseSprite, ig.Event);

    // var bs = new BaseSprite();

    // function TestSub() {

    // }

    // ig.inherits(TestSub, BaseSprite);
    // ig.inherits(BaseSprite, ig.Event);

    // var ts = new TestSub();
    // console.warn(ts);
    // console.warn(bs);

    ig.BaseSprite = BaseSprite;

})(root || this, ig || {});

