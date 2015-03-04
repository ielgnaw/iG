(function (root, factory) {
    var me = factory(root, {});
    if (typeof exports === 'object' && typeof module === 'object') {
        exports = module.exports = me;
    }
    else if (typeof define === 'function' && define.amd) {
        define(me);
    }
    else {
        root.ig = me;
    }
})(this, function (root, ig) {
    'use strict';
