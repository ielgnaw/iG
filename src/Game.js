/**
 * @file Game 类
 * 游戏的主启动在这里，渲染过程：
 * Game: render --> Stage: render --> DisplayObject: render
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var ig = require('./ig');
    var util = require('./util');
    var Event = require('./Event');

    var CONFIG = ig.getConfig();

    /**
     * 名字标示
     *
     * @type {number}
     */
    var GUID_KEY = 0;

    function Game(opts) {
        util.extend(true, this, {
            // 名称
            name: 'ig_game_' + (GUID_KEY++),
            // canvas DOM
            canvas: null,
            // 是否最大化，全屏通常只用设置 opts.maximize = true
            maximize: false,
            // 屏幕大小变化自动适应
            scaleFit: true,
            // 游戏的资源，这里面是待加载的资源
            resource: [],
            // fps
            fps: CONFIG.fps,
            // 宽度
            width: CONFIG.width,
            // 高度
            height: CONFIG.height,
            // 最大宽度
            maxWidth: CONFIG.maxWidth,
            // 最大高度
            maxHeight: CONFIG.maxHeight,
            // 给页面竖向滚动条留下的宽度，当 maximize = true 时生效
            // horizontalPageScroll = true 时，值为 17 ；horizontalPageScroll = number 时，值为 number
            horizontalPageScroll: null
        }, opts);

        if (!this.canvas) {
            throw new Error('Game initialize must be require a canvas param');
        }

        // 暂停
        this.paused = false;

        // 当前游戏实例中的所有场景，堆栈，后进先出
        this.stageStack = [];

        // 当前游戏实例中的所有场景，对象，方便读取
        this.stages = {};

        // 私有属性
        this._ = {};

        // 当前 Game 实例的 resourceLoader
        // this.resourceLoader = new ResourceLoader();

        // initGame.call(this);

        return this;
    }

    var p = Game.prototype;

    // 这里应该是添加场景，然后由场景添加对象，这里只是测试
    p.add = function (obj) {
        obj.game = this;
        this.stageStack.push(obj);
        this.stages[obj.name] = obj;
    };

    p.start = function (stepFunc, execFunc, fps, loopId) {
        var q = ig.loop({
            step: stepFunc,
            exec: execFunc,
            fps: fps,
            loopId: 'mainReq' + loopId
        });
        this.loopId = q.loopId;
    };

    p.stop = function () {
        ig.craf({
            loopId: this.loopId
        });
    };

    util.inherits(Game, Event);

    return Game;

});
