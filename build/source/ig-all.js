(function(_global){
var require, define;
(function () {
    var mods = {};

    define = function (id, deps, factory) {
        mods[id] = {
            id: id,
            deps: deps,
            factory: factory,
            defined: 0,
            exports: {},
            require: createRequire(id)
        };
    };

    require = createRequire('');

    function normalize(id, baseId) {
        if (!baseId) {
            return id;
        }

        if (id.indexOf('.') === 0) {
            var basePath = baseId.split('/');
            var namePath = id.split('/');
            var baseLen = basePath.length - 1;
            var nameLen = namePath.length;
            var cutBaseTerms = 0;
            var cutNameTerms = 0;

            pathLoop: for (var i = 0; i < nameLen; i++) {
                switch (namePath[i]) {
                    case '..':
                        if (cutBaseTerms < baseLen) {
                            cutBaseTerms++;
                            cutNameTerms++;
                        }
                        else {
                            break pathLoop;
                        }
                        break;
                    case '.':
                        cutNameTerms++;
                        break;
                    default:
                        break pathLoop;
                }
            }

            basePath.length = baseLen - cutBaseTerms;
            namePath = namePath.slice(cutNameTerms);

            return basePath.concat(namePath).join('/');
        }

        return id;
    }

    function createRequire(baseId) {
        var cacheMods = {};

        function localRequire(id, callback) {
            if (typeof id === 'string') {
                var exports = cacheMods[id];
                if (!exports) {
                    exports = getModExports(normalize(id, baseId));
                    cacheMods[id] = exports;
                }

                return exports;
            }
            else if (id instanceof Array) {
                callback = callback || function () {};
                callback.apply(this, getModsExports(id, callback, baseId));
            }
        };

        return localRequire;
    }

    function getModsExports(ids, factory, baseId) {
        var es = [];
        var mod = mods[baseId];

        for (var i = 0, l = Math.min(ids.length, factory.length); i < l; i++) {
            var id = normalize(ids[i], baseId);
            var arg;
            switch (id) {
                case 'require':
                    arg = (mod && mod.require) || require;
                    break;
                case 'exports':
                    arg = mod.exports;
                    break;
                case 'module':
                    arg = mod;
                    break;
                default:
                    arg = getModExports(id);
            }
            es.push(arg);
        }

        return es;
    }

    function getModExports(id) {
        var mod = mods[id];
        if (!mod) {
            throw new Error('No ' + id);
        }

        if (!mod.defined) {
            var factory = mod.factory;
            var factoryReturn = factory.apply(
                this,
                getModsExports(mod.deps || [], factory, id)
            );
            if (typeof factoryReturn !== 'undefined') {
                mod.exports = factoryReturn;
            }
            mod.defined = 1;
        }

        return mod.exports;
    }
}());
define('ig', ['ig/ig'], function (main) {return main;});
define('ig/ig', [
    'require',
    './a'
], function (require) {
    var exports = {};
    exports.init = function () {
        console.warn('ig init');
        var a = require('./a');
    };
    return exports;
});define('ig/b', ['require'], function (require) {
    var exports = {};
    exports.init = function () {
        console.warn('bbbb init');
    };
    return exports;
});define('ig/a', ['require'], function (require) {
    var exports = {};
    exports.init = function () {
        console.warn('aaaa init');
    };
    return exports;
});// var zrender = require('zrender');
// zrender.tool = {
//     color : require('zrender/tool/color'),
//     math : require('zrender/tool/math'),
//     util : require('zrender/tool/util'),
//     vector : require('zrender/tool/vector'),
//     area : require('zrender/tool/area'),
//     event : require('zrender/tool/event')
// }

// zrender.animation = {
//     Animation : require('zrender/animation/Animation'),
//     Cip : require('zrender/animation/Clip'),
//     easing : require('zrender/animation/easing')
// }
// var echarts = require('echarts');
// echarts.config = require('echarts/config');
// 
// 
// require("ig/b");
// 
// require("ig/a");
// 
// _global['echarts'] = echarts;
// _global['zrender'] = zrender;

})(window);
