/**
 * @file 音频处理
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var env = require('./env');
    var util = require('./util');
    var ig = require('./ig');

    var sound = null;

    /**
     * WebAudio
     */
    function WebAudioSound() {
        var webSound = {
            channels: [],
            channelMax: 10,
            active: {},
            play: util.noop
        };

        webSound.type = 'WebAudio';
        webSound.soundID = 0;
        webSound.playingSounds = {};

        /**
         * 移除声音
         *
         * @param {number} soundID id 标示
         *
         * @return {Object} 声音对象
         */
        webSound.removeSound = function (soundID) {
            delete webSound.playingSounds[soundID];
            return webSound;
        };

        /**
         * 播放
         *
         * @param {Object} buffer 流对象
         * @param {Object} options 配置参数
         * @param {boolean} options.loop 是否重复
         * @param {number} options.debounce 再次播放声音时，会根据上一个声音播放开始的时间和这个值的和来判断
         *
         * @return {Object} 声音对象
         */
        webSound.play = function (buffer, options) {
            var now = new Date().getTime();

            if (webSound.active[buffer]
                && (webSound.active[buffer] + (options.debounce || 0)) > now
            ) {
                return;
            }

            webSound.active[buffer] = now;

            var soundID = webSound.soundID++;

            var source = ig.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(ig.audioContext.destination);

            if (options && options.loop) {
                source.loop = true;
            }
            else {
                setTimeout(function () {
                    webSound.removeSound(soundID);
                }, source.buffer.duration * 1000);
            }

            source.assetName = buffer;

            if (source.start) {
                source.start(0);
            }
            else {
                source.noteOn(0);
            }

            webSound.playingSounds[soundID] = source;

            return webSound;
        };

        /**
         * 停止
         *
         * @param {Object} buffer 流对象
         *
         * @return {Object} 声音对象
         */
        webSound.stop = function (buffer) {
            for (var key in webSound.playingSounds) {
                var snd = webSound.playingSounds[key];
                if(!buffer || buffer === snd.assetName) {
                    if (snd.stop) {
                        snd.stop(0);
                    }
                    else {
                        snd.noteOff(0);
                    }
                }
            }
            return webSound;
        };

        return webSound;
    }

    /**
     * HTML5Audio
     *
     * @return {Object} 声音对象
     */
    function HTML5Sound() {

        var h5Sound = {
            channels: [],
            channelMax: 10,
            active: {},
            play: util.noop
        };

        h5Sound.type = 'HTML5';

        for (var i = 0; i < h5Sound.channelMax; i++) {
            h5Sound.channels[i] = {};
            h5Sound.channels[i].channel = new Audio();
            h5Sound.channels[i].finished = -1;
        }

        /**
         * hack 方法，为了和 webSound 暴露的方式一致
         *
         * @return {Object} 声音对象
         */
        h5Sound.removeSound = function () {
            return h5Sound;
        };

        /**
         * 播放
         *
         * @param {Object} audioNode audio dom 节点
         * @param {Object} options 配置参数
         * @param {boolean} options.loop 是否重复
         * @param {number} options.debounce 再次播放声音时，会根据上一个声音播放开始的时间和这个值的和来判断
         *
         * @return {Object} 声音对象
         */
        h5Sound.play = function (audioNode, options) {
            var now = new Date().getTime();


            if (h5Sound.active[audioNode]
                && (h5Sound.active[audioNode] + (options.debounce || 0)) > now
            ) {
                return;
            }

            h5Sound.active[audioNode] = now;

            for (var i = 0; i < h5Sound.channels.length; i++) {
                if (!h5Sound.channels[i].loop && h5Sound.channels[i].finished < now) {
                    h5Sound.channels[i].channel.src = audioNode.src;
                    if (options && options.loop) {
                        h5Sound.channels[i].loop = true;
                        h5Sound.channels[i].channel.loop = true;
                    }
                    else {
                        audioNode.duration = 40;
                        h5Sound.channels[i].finished = now + audioNode.duration*1000;
                    }
                    h5Sound.channels[i].channel.load();
                    h5Sound.channels[i].channel.play();
                    break;
                }
            }
            return h5Sound;
        };

        /**
         * 停止
         *
         * @param {Object} audioNode audio dom 节点
         *
         * @return {Object} 声音对象
         */
        h5Sound.stop = function (audioNode) {
            var src = audioNode ? audioNode.src : null;
            var tm = new Date().getTime();
            for (var i = 0; i < h5Sound.channels.length; i++) {
                if ((!src || h5Sound.channels[i].channel.src === src)
                    && (h5Sound.channels[i].loop || h5Sound.channels[i].finished >= tm)
                ) {
                    h5Sound.channels[i].channel.pause();
                    h5Sound.channels[i].loop = false;
                }
            }
            return h5Sound;
        };

        return h5Sound;
    }

    if (!sound) {
        if (env.webAudio) {
            sound = new WebAudioSound();
        }
        else {
            sound = new HTML5Sound();
        }
    }

    return sound;

});
