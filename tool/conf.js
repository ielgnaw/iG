
exports.modules = {
    main: {name: 'ig/ig'},
    parts: [
        {name: 'ig/dep/howler'},

        {name: 'ig/config'},

        {name: 'ig/util', refName: 'util'},
        {name: 'ig/easing', refName: 'easing'},
        {name: 'ig/env', refName: 'env'},

        {name: 'ig/Event'},
        {name: 'ig/Vector', refName: 'Vector'},
        {name: 'ig/Matrix', refName: 'Matrix'},
        // {name: 'ig/Animation', refName: 'Animation'},
        // {name: 'ig/DisplayObject', refName: 'DisplayObject'},
        // {name: 'ig/Text', refName: 'Text'},
        // {name: 'ig/Bitmap', refName: 'Bitmap'},
        // {name: 'ig/BitmapPolygon', refName: 'BitmapPolygon'},
        // {name: 'ig/SpriteSheet', refName: 'SpriteSheet'},
        // {name: 'ig/ResourceLoader'},
        // {name: 'ig/Game', refName: 'Game'},
        // {name: 'ig/Stage'},
        {name: 'ig/domEvt'},
        // {name: 'ig/Storage', refName: 'Storage'},

        // {name: 'ig/Projection'},
        // {name: 'ig/Rectangle', refName: 'Rectangle'},
        // {name: 'ig/Polygon', refName: 'Polygon'}


        // refName 指要挂载到 window.ig 这个全局空间上的名字
        // 如果无 refName 配置，意味着该模板只是 ig 内部调用的，不会被挂载在 window 上
        // {name: 'ig/SpriteSheet', refName: 'SpriteSheet'}, // window.ig.SpriteSheet

        // {name: 'ig/Shape/Ball', refName: 'Ball', folder: 'Shape'}, // window.ig.Shape.Ball

        // {name: 'ig/geom/Circle', refName: 'Circle', folder: 'geom'}, // window.ig.geom.Circle
        // {name: 'ig/geom/Vector', refName: 'Vector', folder: 'geom'}, // window.ig.geom.Vector
        // {name: 'ig/geom/Polygon', refName: 'Polygon', folder: 'geom'}, // window.ig.geom.Polygon
        // {name: 'ig/geom/Rect', refName: 'Rect', folder: 'geom'}, // window.ig.geom.Rect
        // {name: 'ig/collision'},

        // {name: 'ig/geom/polygon', folder: 'geom'},
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
