
exports.modules = {
    main: {name: 'ig/ig'},
    parts: [
        {name: 'ig/util'},
        {name: 'ig/event'},
        {name: 'ig/platform'},
        {name: 'ig/BaseSprite'},
        {name: 'ig/ImageLoader'}
        // ,{name: 'ig/test/one'}
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
