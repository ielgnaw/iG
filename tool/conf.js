
exports.modules = {
    main: {name: 'ig/ig'},
    parts: [
        {name: 'ig/util', refName: 'util'},
        {name: 'ig/easing', refName: 'easing'},
        {name: 'ig/env', refName: 'env'},
        {name: 'ig/Animation', refName: 'Animation'},
        {name: 'ig/Vector', refName: 'Vector'},
        {name: 'ig/Game', refName: 'Game'},
        {name: 'ig/Stage', refName: 'Stage'},
        {name: 'ig/Event'},
        {name: 'ig/domEvt'},
        {name: 'ig/resourceLoader'},
        // refName 指要挂载到 window.ig 这个全局空间上的名字
        // 如果无 refName 配置，意味着该模板只是 ig 内部调用的，不会被挂载在 window 上
        // {name: 'ig/util', refName: 'util'},     // window.ig.util
        // {name: 'ig/Event', refName: 'Event'},   // window.ig.Event
        // {name: 'ig/env', refName: 'env'},  // window.ig.env
        // {name: 'ig/Game', refName: 'Game'}, // window.ig.Game
        // {name: 'ig/Stage'},
        // {name: 'ig/DisplayObject', refName: 'DisplayObject'}, // window.ig.FrameMonitor
        // {name: 'ig/SpriteSheet', refName: 'SpriteSheet'}, // window.ig.SpriteSheet
        // {name: 'ig/resourceLoader'},
        // {name: 'ig/Stage'},

        // {name: 'ig/Shape/Ball', refName: 'Ball', folder: 'Shape'}, // window.ig.Shape.Ball

        // {name: 'ig/geom/Circle', refName: 'Circle', folder: 'geom'}, // window.ig.geom.Circle
        // {name: 'ig/geom/Vector', refName: 'Vector', folder: 'geom'}, // window.ig.geom.Vector
        // {name: 'ig/geom/Polygon', refName: 'Polygon', folder: 'geom'}, // window.ig.geom.Polygon
        // {name: 'ig/geom/Rect', refName: 'Rect', folder: 'geom'}, // window.ig.geom.Rect
        // {name: 'ig/collision'},

        // {name: 'ig/geom/polygon', folder: 'geom'},
        // {name: 'ig/domEvt'},
        // {name: 'ig/Bitmap', refName: 'Bitmap'},
        // {name: 'ig/Text', refName: 'Text'},
        // {name: 'ig/easing', refName: 'easing'},
        // {name: 'ig/Animation', refName: 'Animation'}
    ]
};

exports.amd = {
    // baseUrl: require('path').resolve(process.cwd(), '..'),
    // baseUrl: process.cwd(),
    baseUrl: __dirname,
    packages: [
        {
            name: 'ig',
            location: '../src',
            main: 'ig'
        }
    ]
};

exports.name = 'ig';
exports.includeEsl = true;
