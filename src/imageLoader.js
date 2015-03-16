/**
 * @file 图片加载
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var Event = require('./Event');
    var util = require('./util');

    var arrayProto = Array.prototype;

    /**
     * 图片加载构造器
     *
     * @constructor
     */
    function ImageLoader(opts) {
        opts = opts || {};
        Event.apply(this, arguments);
        this.images = {};

        var imageUrls = opts.imageUrls || [];
        Array.isArray(imageUrls) ? (this.imageUrls = imageUrls) : (this.imageUrls = [imageUrls]);

        this.imagesLoadedCount = 0;
        this.imagesErrorLoadedCount = 0;
        this.imageIndex = 0;
        this.allCallback = opts.allCallback || util.noop;
    }

    ImageLoader.prototype = {
        /**
         * 还原构造
         *
         * @type {[type]}
         */
        constructor: ImageLoader,

        /**
         * 添加图片
         *
         * @param {Array | string} imageUrls 图片 url
         */
        addImages: function (imageUrls) {
            var me = this;
            arrayProto.push[Array.isArray(imageUrls) ? 'apply' : 'call'](me.imageUrls, imageUrls);
        },

        /**
         * 加载图片
         */
        load: function () {
            var me = this;
            var len = me.imageUrls.length;
            for (var i = 0; i < len; i++) {
                var imgSrc = me.imageUrls[i];
                me.images[imgSrc] = new Image();

                /* jshint loopfunc:true */
                me.images[imgSrc].addEventListener('load', function (e) {
                    me.imagesLoadedCount++;
                    me.fire('ImageLoader:imageLoaded', {
                        data: {
                            progress: (me.imagesLoadedCount + me.imagesErrorLoadedCount) / len * 100,
                            curImg: me.images[imgSrc]
                        }
                    });

                    if (me.imagesLoadedCount >= len) {
                        me.fire('ImageLoader:allImageLoaded', {
                            data: {
                                allCount: len,
                                imageList: me.imageUrls,
                                images: me.images
                            }
                        });
                        me.allCallback.call(me);
                    }
                });

                me.images[imgSrc].addEventListener('error', function (e) {
                    me.imagesErrorLoadedCount++;
                    me.fire('ImageLoader:imageLoadedError', {
                        data: {
                            progress: (me.imagesLoadedCount + me.imagesErrorLoadedCount) / len * 100,
                            curImg: me.images[imgSrc]
                        }
                    });
                });

                me.images[imgSrc].src = imgSrc;
            }
        }
    };

    util.inherits(ImageLoader, Event);

    return ImageLoader;
});
