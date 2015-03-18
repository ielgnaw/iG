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
     * 图片加载构造器，图片格式为: {id: 'xxxx', src: 'path'} 或 'path'
     *
     * @param {opts} opts 参数
     *
     * @extends {Event}
     * @constructor
     */
    function ImageLoader(opts) {
        Event.apply(this, arguments);

        opts = opts || {};

        var source = opts.source || [];
        Array.isArray(source) ? (this.source = source) : (this.source = [source]);

        this.allCallback = opts.allCallback || util.noop;

        this.imagesLoadedCount = 0;
        this.imagesErrorLoadedCount = 0;

        this.images = {};
        this.imageList = [];
    }

    ImageLoader.prototype = {
        /**
         * 还原构造
         *
         * @type {Function}
         */
        constructor: ImageLoader,

        /**
         * 添加图片
         *
         * @param {Array | string} source 图片资源
         */
        addImages: function (source) {
            var me = this;
            arrayProto.push[Array.isArray(source) ? 'apply' : 'call'](me.source, source);
        },

        /**
         * 加载图片
         */
        load: function () {
            var me = this;
            var len = me.source.length;
            for (var i = 0; i < len; i++) {
                var tmp = me.source[i];
                var imgId;
                var imgSrc;
                // {id: 'idid', src: 'path'}
                if (util.getType(tmp) === 'object') {
                    imgId = tmp.id;
                    imgSrc = tmp.src;
                }
                // 'path'
                else {
                    imgId = imgSrc = tmp;
                }

                me.images[imgId] = new Image();
                me.imageList.push(me.images[imgId]);

                /* jshint loopfunc:true */
                me.images[imgId].addEventListener('load', function (e) {
                    me.imagesLoadedCount++;
                    me.fire('ImageLoader:imageLoaded', {
                        data: {
                            progress: (me.imagesLoadedCount + me.imagesErrorLoadedCount) / len * 100,
                            curImg: me.images[imgId]
                        }
                    });

                    if (me.imagesLoadedCount >= len) {
                        me.fire('ImageLoader:allImageLoaded', {
                            data: {
                                allCount: len,
                                imageList: me.imageList,
                                images: me.images
                            }
                        });
                        me.allCallback.call(me);
                    }
                });

                me.images[imgId].addEventListener('error', function (e) {
                    me.imagesErrorLoadedCount++;
                    me.fire('ImageLoader:imageLoadedError', {
                        data: {
                            progress: (me.imagesLoadedCount + me.imagesErrorLoadedCount) / len * 100,
                            curImg: me.images[imgId]
                        }
                    });
                });

                me.images[imgId].src = imgSrc;
            }
        }
    };

    util.inherits(ImageLoader, Event);

    return ImageLoader;
});
