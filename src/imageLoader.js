/**
 * @file 图片加载
 * @author ielgnaw(wuji0223@gmail.com)
 */

(function (root, ig, undefined) {

    /**
     * 图片加载构造器
     *
     * @constructor
     */
    function ImageLoader() {
        this.images = {};
        this.imageUrls = [];
        this.imagesLoadedCount = 0;
        this.imagesErrorLoadedCount = 0;
        this.imageIndex = 0;
        this.imageLoadingProgressCallback = ig.noop;
    };

    ImageLoader.prototype.imageLoadedCallback = function () {
        this.imagesLoadedCount++;
    };

    ImageLoader.prototype.imageLoadedErrorCallback = function () {
        this.imagesErrorLoadedCount++;
    };

    ImageLoader.prototype.loadImage = function (imageUrl) {
        var me = this;
        var img = new Image();
        img.src = imageUrl;
        img.addEventListener('load', function (e) {
            me.imageLoadedCallback(e);
        });
        img.addEventListener('error', function (e) {
            me.imageLoadedErrorCallback(e);
        });

        me.images[imageUrl] = img;
    };

    ImageLoader.prototype.loadImages = function (imageUrl) {
        var me = this;

        var imageUrlsLen = me.imageUrls.length;

        if (me.imageIndex < imageUrlsLen) {
            me.loadImage(me.imageUrls[me.imageIndex]);
            me.imageIndex++;
        }

        return (me.imagesLoadedCount + me.imagesErrorLoadedCount) / imageUrlsLen * 100;
    };

    ImageLoader.prototype.addImage = function (imageUrls) {
        var me = this;
        if (Array.isArray(imageUrls)) {
            me.imageUrls.concat(imageUrls);
        }
        else {
            me.imageUrls.push(imageUrls);
        }
    };

    var il = new ImageLoader();

    il.addImage('/examples/1/img/mute_35x35.png');
    il.addImage('/examples/1/img/thinNumbers_25x32.png');
    il.addImage('/examples/1/img/fatNumbers_33x41.png');
    il.addImage('/examples/1/img/pop_156x141.png');
    il.addImage('/examples/1/img/dots_64x86.png');
    il.addImage('/examples/1/img/panels_383x550.png');
    il.addImage('/examples/1/img/quitBut.png');
    il.addImage('/examples/1/img/playBut.png');
    il.addImage('/examples/1/img/hud.png');
    il.addImage('/examples/1/img/rotateDeviceMessage.jpg');
    il.addImage('/examples/1/img/bg.jpg');

    var percentComplete = il.loadImages();
    var interval = setInterval(function (e) {
        var percentComplete = il.loadImages();
        console.warn(il);
        console.warn(percentComplete.toFixed());

        if (percentComplete >= 100) {
            clearInterval(interval)
        }
    }, 16);



    ig.inherits(ImageLoader, ig.Event);

    // var a = new ImageLoader();
    // a.on('test', function () {
    //     console.error(arguments);
    // });
    // a.fire('test', {s: 1});
    // console.warn(a);
    ig.ImageLoader = ImageLoader;

})(root || this, ig || {});
