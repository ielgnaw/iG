
exports.modules = {
    main: {name: 'ig/ig'},
    parts: [
        // refName 指要挂载到 window.ig 这个全局空间上的名字
        {name: 'ig/util', refName: 'util'},     // window.ig.util
        {name: 'ig/Event', refName: 'Event'},   // window.ig.Event
        {name: 'ig/env', refName: 'env'},  // window.ig.env
        {name: 'ig/ImageLoader', refName: 'ImageLoader'}, // window.ig.ImageLoader
        {name: 'ig/Game', refName: 'Game'}, // window.ig.Game
        {name: 'ig/FrameMonitor', refName: 'FrameMonitor'}, // window.ig.FrameMonitor
        {name: 'ig/Stage', refName: 'Stage'}, // window.ig.FrameMonitor
        {name: 'ig/DisplayObject', refName: 'DisplayObject'}, // window.ig.FrameMonitor
        {name: 'ig/SpriteSheet', refName: 'SpriteSheet'}, // window.ig.SpriteSheet
        {name: 'ig/ParallaxScroll', refName: 'ParallaxScroll'}, // window.ig.ParallaxScroll
        {name: 'ig/Shape/Ball', refName: 'Ball', folder: 'Shape'}, // window.ig.Shape.Ball
        {name: 'ig/resourceLoader', refName: 'resourceLoader'} // window.ig.resourceLoader
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
