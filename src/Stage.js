/**
 * @file 场景类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var Event = require('./Event');
    var util = require('./util');
    var DisplayObject = require('./DisplayObject');
    var domEvt = require('./domEvt');

    function Stage(opts) {

        return this;
    }


    util.inherits(Stage, Event);

    return Stage;
});
