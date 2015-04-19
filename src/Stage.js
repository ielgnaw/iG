/**
 * @file 场景类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var Event = require('./Event');
    var util = require('./util');
    // var DisplayObject = require('./DisplayObject');
    var domEvt = require('./domEvt');

    /**
     * 名字标示
     *
     * @type {number}
     */
    var GUID_KEY = 0;

    function Stage(opts) {

        // 属性全部挂载在 p 这个属性下，避免实例上挂载的属性太多，太乱
        this.p = {};

        util.extend(true, this.p, {
            // 名称
            name: 'ig_stage_' + (GUID_KEY++),
            canvas: opts.canvas,
            ctx: opts.canvas.getContext('2d'),
            offCanvas: opts.offCanvas,
            offCtx: opts.offCanvas.getContext('2d'),
            width: opts.gameOwner.width,
            height: opts.gameOwner.height,
            cssWidth: opts.gameOwner.cssWidth,
            cssHeight: opts.gameOwner.cssHeight,
        }, opts);

        // 当前场景中的所有可显示对象集合
        this.p.displayObjectList = [];

        // 当前场景中的所有可显示对象，对象，方便读取
        this.p.displayObjects = {};

        console.warn(this);

        // 初始化 mouse 和 touch 事件
        // this.initMouseEvent();

        Event.apply(this, this.p);

        return this;
    }


    util.inherits(Stage, Event);

    return Stage;
});
