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
'use strict';
define('ig/ig', [
    'require',
    './util'
], function (require) {
    (function () {
        var lastTime = 0;
        var vendors = [
            'ms',
            'moz',
            'webkit',
            'o'
        ];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    }());
    var util = require('./util');
    var exports = {};
    exports.STATUS = {
        NORMAL: 1,
        NOT_RENDER: 2,
        NOT_UPDATE: 3,
        NOT_RU: 4,
        DESTROYED: 5
    };
    exports.STANDARD_FPS = 60;
    exports.loop = function (opts) {
        var conf = util.extend(true, {}, {
            step: util.noop,
            exec: util.noop,
            jumpFrames: 0
        }, opts);
        var requestID;
        var now;
        var then = Date.now();
        var frameUpdateCount = 0;
        var passed = 0;
        var dt = 1000 / exports.STANDARD_FPS;
        var acc = 0;
        (function tick() {
            requestID = window.requestAnimationFrame(tick);
            frameUpdateCount++;
            if (frameUpdateCount > conf.jumpFrames) {
                frameUpdateCount = 0;
                now = Date.now();
                passed = now - then;
                then = now;
                acc += passed;
                while (acc >= dt) {
                    conf.step(dt * (exports.STANDARD_FPS / 1000), requestID);
                    acc -= dt;
                }
                conf.exec();
            }
        }());
    };
    return exports;
});'use strict';
define('ig/dep/howler', ['require'], function (require) {
    var cache = {};
    var ctx = null, usingWebAudio = true, noAudio = false;
    try {
        if (typeof AudioContext !== 'undefined') {
            ctx = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            ctx = new webkitAudioContext();
        } else {
            usingWebAudio = false;
        }
    } catch (e) {
        usingWebAudio = false;
    }
    if (!usingWebAudio) {
        if (typeof Audio !== 'undefined') {
            try {
                new Audio();
            } catch (e) {
                noAudio = true;
            }
        } else {
            noAudio = true;
        }
    }
    if (usingWebAudio) {
        var masterGain = typeof ctx.createGain === 'undefined' ? ctx.createGainNode() : ctx.createGain();
        masterGain.gain.value = 1;
        masterGain.connect(ctx.destination);
    }
    var HowlerGlobal = function (codecs) {
        this._volume = 1;
        this._muted = false;
        this.usingWebAudio = usingWebAudio;
        this.ctx = ctx;
        this.noAudio = noAudio;
        this._howls = [];
        this._codecs = codecs;
        this.iOSAutoEnable = true;
    };
    HowlerGlobal.prototype = {
        volume: function (vol) {
            var self = this;
            vol = parseFloat(vol);
            if (vol >= 0 && vol <= 1) {
                self._volume = vol;
                if (usingWebAudio) {
                    masterGain.gain.value = vol;
                }
                for (var key in self._howls) {
                    if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
                        for (var i = 0; i < self._howls[key]._audioNode.length; i++) {
                            self._howls[key]._audioNode[i].volume = self._howls[key]._volume * self._volume;
                        }
                    }
                }
                return self;
            }
            return usingWebAudio ? masterGain.gain.value : self._volume;
        },
        mute: function () {
            this._setMuted(true);
            return this;
        },
        unmute: function () {
            this._setMuted(false);
            return this;
        },
        _setMuted: function (muted) {
            var self = this;
            self._muted = muted;
            if (usingWebAudio) {
                masterGain.gain.value = muted ? 0 : self._volume;
            }
            for (var key in self._howls) {
                if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
                    for (var i = 0; i < self._howls[key]._audioNode.length; i++) {
                        self._howls[key]._audioNode[i].muted = muted;
                    }
                }
            }
        },
        codecs: function (ext) {
            return this._codecs[ext];
        },
        _enableiOSAudio: function () {
            var self = this;
            if (ctx && (self._iOSEnabled || !/iPhone|iPad|iPod/i.test(navigator.userAgent))) {
                return;
            }
            self._iOSEnabled = false;
            var unlock = function () {
                var buffer = ctx.createBuffer(1, 1, 22050);
                var source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                if (typeof source.start === 'undefined') {
                    source.noteOn(0);
                } else {
                    source.start(0);
                }
                setTimeout(function () {
                    if (source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE) {
                        self._iOSEnabled = true;
                        self.iOSAutoEnable = false;
                        window.removeEventListener('touchstart', unlock, false);
                    }
                }, 0);
            };
            window.addEventListener('touchstart', unlock, false);
            return self;
        }
    };
    var audioTest = null;
    var codecs = {};
    if (!noAudio) {
        audioTest = new Audio();
        codecs = {
            mp3: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/, ''),
            opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
            ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
            wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
            aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
            m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
            mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
            weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')
        };
    }
    var Howler = new HowlerGlobal(codecs);
    var Howl = function (o) {
        var self = this;
        self._autoplay = o.autoplay || false;
        self._buffer = o.buffer || false;
        self._duration = o.duration || 0;
        self._format = o.format || null;
        self._loop = o.loop || false;
        self._loaded = false;
        self._sprite = o.sprite || {};
        self._src = o.src || '';
        self._pos3d = o.pos3d || [
            0,
            0,
            -0.5
        ];
        self._volume = o.volume !== undefined ? o.volume : 1;
        self._urls = o.urls || [];
        self._rate = o.rate || 1;
        self._model = o.model || null;
        self._onload = [o.onload || function () {
            }];
        self._onloaderror = [o.onloaderror || function () {
            }];
        self._onend = [o.onend || function () {
            }];
        self._onpause = [o.onpause || function () {
            }];
        self._onplay = [o.onplay || function () {
            }];
        self._onendTimer = [];
        self._webAudio = usingWebAudio && !self._buffer;
        self._audioNode = [];
        if (self._webAudio) {
            self._setupAudioNode();
        }
        if (typeof ctx !== 'undefined' && ctx && Howler.iOSAutoEnable) {
            Howler._enableiOSAudio();
        }
        Howler._howls.push(self);
        self.load();
    };
    Howl.prototype = {
        load: function () {
            var self = this, url = null;
            if (noAudio) {
                self.on('loaderror');
                return;
            }
            for (var i = 0; i < self._urls.length; i++) {
                var ext, urlItem;
                if (self._format) {
                    ext = self._format;
                } else {
                    urlItem = self._urls[i];
                    ext = /^data:audio\/([^;,]+);/i.exec(urlItem);
                    if (!ext) {
                        ext = /\.([^.]+)$/.exec(urlItem.split('?', 1)[0]);
                    }
                    if (ext) {
                        ext = ext[1].toLowerCase();
                    } else {
                        self.on('loaderror');
                        return;
                    }
                }
                if (codecs[ext]) {
                    url = self._urls[i];
                    break;
                }
            }
            if (!url) {
                self.on('loaderror');
                return;
            }
            self._src = url;
            if (self._webAudio) {
                loadBuffer(self, url);
            } else {
                var newNode = new Audio();
                newNode.addEventListener('error', function () {
                    if (newNode.error && newNode.error.code === 4) {
                        HowlerGlobal.noAudio = true;
                    }
                    self.on('loaderror', { type: newNode.error ? newNode.error.code : 0 });
                }, false);
                self._audioNode.push(newNode);
                newNode.src = url;
                newNode._pos = 0;
                newNode.preload = 'auto';
                newNode.volume = Howler._muted ? 0 : self._volume * Howler.volume();
                var listener = function () {
                    self._duration = Math.ceil(newNode.duration * 10) / 10;
                    if (Object.getOwnPropertyNames(self._sprite).length === 0) {
                        self._sprite = {
                            _default: [
                                0,
                                self._duration * 1000
                            ]
                        };
                    }
                    if (!self._loaded) {
                        self._loaded = true;
                        self.on('load');
                    }
                    if (self._autoplay) {
                        self.play();
                    }
                    newNode.removeEventListener('canplaythrough', listener, false);
                };
                newNode.addEventListener('canplaythrough', listener, false);
                newNode.load();
            }
            return self;
        },
        urls: function (urls) {
            var self = this;
            if (urls) {
                self.stop();
                self._urls = typeof urls === 'string' ? [urls] : urls;
                self._loaded = false;
                self.load();
                return self;
            } else {
                return self._urls;
            }
        },
        play: function (sprite, callback) {
            var self = this;
            if (typeof sprite === 'function') {
                callback = sprite;
            }
            if (!sprite || typeof sprite === 'function') {
                sprite = '_default';
            }
            if (!self._loaded) {
                self.on('load', function () {
                    self.play(sprite, callback);
                });
                return self;
            }
            if (!self._sprite[sprite]) {
                if (typeof callback === 'function')
                    callback();
                return self;
            }
            self._inactiveNode(function (node) {
                node._sprite = sprite;
                var pos = node._pos > 0 ? node._pos : self._sprite[sprite][0] / 1000;
                var duration = 0;
                if (self._webAudio) {
                    duration = self._sprite[sprite][1] / 1000 - node._pos;
                    if (node._pos > 0) {
                        pos = self._sprite[sprite][0] / 1000 + pos;
                    }
                } else {
                    duration = self._sprite[sprite][1] / 1000 - (pos - self._sprite[sprite][0] / 1000);
                }
                var loop = !!(self._loop || self._sprite[sprite][2]);
                var soundId = typeof callback === 'string' ? callback : Math.round(Date.now() * Math.random()) + '', timerId;
                (function () {
                    var data = {
                        id: soundId,
                        sprite: sprite,
                        loop: loop
                    };
                    timerId = setTimeout(function () {
                        if (!self._webAudio && loop) {
                            self.stop(data.id).play(sprite, data.id);
                        }
                        if (self._webAudio && !loop) {
                            self._nodeById(data.id).paused = true;
                            self._nodeById(data.id)._pos = 0;
                            self._clearEndTimer(data.id);
                        }
                        if (!self._webAudio && !loop) {
                            self.stop(data.id);
                        }
                        self.on('end', soundId);
                    }, duration * 1000);
                    self._onendTimer.push({
                        timer: timerId,
                        id: data.id
                    });
                }());
                if (self._webAudio) {
                    var loopStart = self._sprite[sprite][0] / 1000, loopEnd = self._sprite[sprite][1] / 1000;
                    node.id = soundId;
                    node.paused = false;
                    refreshBuffer(self, [
                        loop,
                        loopStart,
                        loopEnd
                    ], soundId);
                    self._playStart = ctx.currentTime;
                    node.gain.value = self._volume;
                    if (typeof node.bufferSource.start === 'undefined') {
                        loop ? node.bufferSource.noteGrainOn(0, pos, 86400) : node.bufferSource.noteGrainOn(0, pos, duration);
                    } else {
                        loop ? node.bufferSource.start(0, pos, 86400) : node.bufferSource.start(0, pos, duration);
                    }
                } else {
                    if (node.readyState === 4 || !node.readyState && navigator.isCocoonJS) {
                        node.readyState = 4;
                        node.id = soundId;
                        node.currentTime = pos;
                        node.muted = Howler._muted || node.muted;
                        node.volume = self._volume * Howler.volume();
                        setTimeout(function () {
                            node.play();
                        }, 0);
                    } else {
                        self._clearEndTimer(soundId);
                        (function () {
                            var sound = self, playSprite = sprite, fn = callback, newNode = node;
                            var listener = function () {
                                sound.play(playSprite, fn);
                                newNode.removeEventListener('canplaythrough', listener, false);
                            };
                            newNode.addEventListener('canplaythrough', listener, false);
                        }());
                        return self;
                    }
                }
                self.on('play');
                if (typeof callback === 'function')
                    callback(soundId);
                return self;
            });
            return self;
        },
        pause: function (id) {
            var self = this;
            if (!self._loaded) {
                self.on('play', function () {
                    self.pause(id);
                });
                return self;
            }
            self._clearEndTimer(id);
            var activeNode = id ? self._nodeById(id) : self._activeNode();
            if (activeNode) {
                activeNode._pos = self.pos(null, id);
                if (self._webAudio) {
                    if (!activeNode.bufferSource || activeNode.paused) {
                        return self;
                    }
                    activeNode.paused = true;
                    if (typeof activeNode.bufferSource.stop === 'undefined') {
                        activeNode.bufferSource.noteOff(0);
                    } else {
                        activeNode.bufferSource.stop(0);
                    }
                } else {
                    activeNode.pause();
                }
            }
            self.on('pause');
            return self;
        },
        stop: function (id) {
            var self = this;
            if (!self._loaded) {
                self.on('play', function () {
                    self.stop(id);
                });
                return self;
            }
            self._clearEndTimer(id);
            var activeNode = id ? self._nodeById(id) : self._activeNode();
            if (activeNode) {
                activeNode._pos = 0;
                if (self._webAudio) {
                    if (!activeNode.bufferSource || activeNode.paused) {
                        return self;
                    }
                    activeNode.paused = true;
                    if (typeof activeNode.bufferSource.stop === 'undefined') {
                        activeNode.bufferSource.noteOff(0);
                    } else {
                        activeNode.bufferSource.stop(0);
                    }
                } else if (!isNaN(activeNode.duration)) {
                    activeNode.pause();
                    activeNode.currentTime = 0;
                }
            }
            return self;
        },
        mute: function (id) {
            var self = this;
            if (!self._loaded) {
                self.on('play', function () {
                    self.mute(id);
                });
                return self;
            }
            var activeNode = id ? self._nodeById(id) : self._activeNode();
            if (activeNode) {
                if (self._webAudio) {
                    activeNode.gain.value = 0;
                } else {
                    activeNode.muted = true;
                }
            }
            return self;
        },
        unmute: function (id) {
            var self = this;
            if (!self._loaded) {
                self.on('play', function () {
                    self.unmute(id);
                });
                return self;
            }
            var activeNode = id ? self._nodeById(id) : self._activeNode();
            if (activeNode) {
                if (self._webAudio) {
                    activeNode.gain.value = self._volume;
                } else {
                    activeNode.muted = false;
                }
            }
            return self;
        },
        volume: function (vol, id) {
            var self = this;
            vol = parseFloat(vol);
            if (vol >= 0 && vol <= 1) {
                self._volume = vol;
                if (!self._loaded) {
                    self.on('play', function () {
                        self.volume(vol, id);
                    });
                    return self;
                }
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                if (activeNode) {
                    if (self._webAudio) {
                        activeNode.gain.value = vol;
                    } else {
                        activeNode.volume = vol * Howler.volume();
                    }
                }
                return self;
            } else {
                return self._volume;
            }
        },
        loop: function (loop) {
            var self = this;
            if (typeof loop === 'boolean') {
                self._loop = loop;
                return self;
            } else {
                return self._loop;
            }
        },
        sprite: function (sprite) {
            var self = this;
            if (typeof sprite === 'object') {
                self._sprite = sprite;
                return self;
            } else {
                return self._sprite;
            }
        },
        pos: function (pos, id) {
            var self = this;
            if (!self._loaded) {
                self.on('load', function () {
                    self.pos(pos);
                });
                return typeof pos === 'number' ? self : self._pos || 0;
            }
            pos = parseFloat(pos);
            var activeNode = id ? self._nodeById(id) : self._activeNode();
            if (activeNode) {
                if (pos >= 0) {
                    self.pause(id);
                    activeNode._pos = pos;
                    self.play(activeNode._sprite, id);
                    return self;
                } else {
                    return self._webAudio ? activeNode._pos + (ctx.currentTime - self._playStart) : activeNode.currentTime;
                }
            } else if (pos >= 0) {
                return self;
            } else {
                for (var i = 0; i < self._audioNode.length; i++) {
                    if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
                        return self._webAudio ? self._audioNode[i]._pos : self._audioNode[i].currentTime;
                    }
                }
            }
        },
        pos3d: function (x, y, z, id) {
            var self = this;
            y = typeof y === 'undefined' || !y ? 0 : y;
            z = typeof z === 'undefined' || !z ? -0.5 : z;
            if (!self._loaded) {
                self.on('play', function () {
                    self.pos3d(x, y, z, id);
                });
                return self;
            }
            if (x >= 0 || x < 0) {
                if (self._webAudio) {
                    var activeNode = id ? self._nodeById(id) : self._activeNode();
                    if (activeNode) {
                        self._pos3d = [
                            x,
                            y,
                            z
                        ];
                        activeNode.panner.setPosition(x, y, z);
                        activeNode.panner.panningModel = self._model || 'HRTF';
                    }
                }
            } else {
                return self._pos3d;
            }
            return self;
        },
        fade: function (from, to, len, callback, id) {
            var self = this, diff = Math.abs(from - to), dir = from > to ? 'down' : 'up', steps = diff / 0.01, stepTime = len / steps;
            if (!self._loaded) {
                self.on('load', function () {
                    self.fade(from, to, len, callback, id);
                });
                return self;
            }
            self.volume(from, id);
            for (var i = 1; i <= steps; i++) {
                (function () {
                    var change = self._volume + (dir === 'up' ? 0.01 : -0.01) * i, vol = Math.round(1000 * change) / 1000, toVol = to;
                    setTimeout(function () {
                        self.volume(vol, id);
                        if (vol === toVol) {
                            if (callback)
                                callback();
                        }
                    }, stepTime * i);
                }());
            }
        },
        fadeIn: function (to, len, callback) {
            return this.volume(0).play().fade(0, to, len, callback);
        },
        fadeOut: function (to, len, callback, id) {
            var self = this;
            return self.fade(self._volume, to, len, function () {
                if (callback)
                    callback();
                self.pause(id);
                self.on('end');
            }, id);
        },
        _nodeById: function (id) {
            var self = this, node = self._audioNode[0];
            for (var i = 0; i < self._audioNode.length; i++) {
                if (self._audioNode[i].id === id) {
                    node = self._audioNode[i];
                    break;
                }
            }
            return node;
        },
        _activeNode: function () {
            var self = this, node = null;
            for (var i = 0; i < self._audioNode.length; i++) {
                if (!self._audioNode[i].paused) {
                    node = self._audioNode[i];
                    break;
                }
            }
            self._drainPool();
            return node;
        },
        _inactiveNode: function (callback) {
            var self = this, node = null;
            for (var i = 0; i < self._audioNode.length; i++) {
                if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
                    callback(self._audioNode[i]);
                    node = true;
                    break;
                }
            }
            self._drainPool();
            if (node) {
                return;
            }
            var newNode;
            if (self._webAudio) {
                newNode = self._setupAudioNode();
                callback(newNode);
            } else {
                self.load();
                newNode = self._audioNode[self._audioNode.length - 1];
                var listenerEvent = navigator.isCocoonJS ? 'canplaythrough' : 'loadedmetadata';
                var listener = function () {
                    newNode.removeEventListener(listenerEvent, listener, false);
                    callback(newNode);
                };
                newNode.addEventListener(listenerEvent, listener, false);
            }
        },
        _drainPool: function () {
            var self = this, inactive = 0, i;
            for (i = 0; i < self._audioNode.length; i++) {
                if (self._audioNode[i].paused) {
                    inactive++;
                }
            }
            for (i = self._audioNode.length - 1; i >= 0; i--) {
                if (inactive <= 5) {
                    break;
                }
                if (self._audioNode[i].paused) {
                    if (self._webAudio) {
                        self._audioNode[i].disconnect(0);
                    }
                    inactive--;
                    self._audioNode.splice(i, 1);
                }
            }
        },
        _clearEndTimer: function (soundId) {
            var self = this, index = 0;
            for (var i = 0; i < self._onendTimer.length; i++) {
                if (self._onendTimer[i].id === soundId) {
                    index = i;
                    break;
                }
            }
            var timer = self._onendTimer[index];
            if (timer) {
                clearTimeout(timer.timer);
                self._onendTimer.splice(index, 1);
            }
        },
        _setupAudioNode: function () {
            var self = this, node = self._audioNode, index = self._audioNode.length;
            node[index] = typeof ctx.createGain === 'undefined' ? ctx.createGainNode() : ctx.createGain();
            node[index].gain.value = self._volume;
            node[index].paused = true;
            node[index]._pos = 0;
            node[index].readyState = 4;
            node[index].connect(masterGain);
            node[index].panner = ctx.createPanner();
            node[index].panner.panningModel = self._model || 'equalpower';
            node[index].panner.setPosition(self._pos3d[0], self._pos3d[1], self._pos3d[2]);
            node[index].panner.connect(node[index]);
            return node[index];
        },
        on: function (event, fn) {
            var self = this, events = self['_on' + event];
            if (typeof fn === 'function') {
                events.push(fn);
            } else {
                for (var i = 0; i < events.length; i++) {
                    if (fn) {
                        events[i].call(self, fn);
                    } else {
                        events[i].call(self);
                    }
                }
            }
            return self;
        },
        off: function (event, fn) {
            var self = this, events = self['_on' + event], fnString = fn ? fn.toString() : null;
            if (fnString) {
                for (var i = 0; i < events.length; i++) {
                    if (fnString === events[i].toString()) {
                        events.splice(i, 1);
                        break;
                    }
                }
            } else {
                self['_on' + event] = [];
            }
            return self;
        },
        unload: function () {
            var self = this;
            var nodes = self._audioNode;
            for (var i = 0; i < self._audioNode.length; i++) {
                if (!nodes[i].paused) {
                    self.stop(nodes[i].id);
                    self.on('end', nodes[i].id);
                }
                if (!self._webAudio) {
                    nodes[i].src = '';
                } else {
                    nodes[i].disconnect(0);
                }
            }
            for (i = 0; i < self._onendTimer.length; i++) {
                clearTimeout(self._onendTimer[i].timer);
            }
            var index = Howler._howls.indexOf(self);
            if (index !== null && index >= 0) {
                Howler._howls.splice(index, 1);
            }
            delete cache[self._src];
            self = null;
        }
    };
    if (usingWebAudio) {
        var loadBuffer = function (obj, url) {
            if (url in cache) {
                obj._duration = cache[url].duration;
                loadSound(obj);
                return;
            }
            if (/^data:[^;]+;base64,/.test(url)) {
                var data = atob(url.split(',')[1]);
                var dataView = new Uint8Array(data.length);
                for (var i = 0; i < data.length; ++i) {
                    dataView[i] = data.charCodeAt(i);
                }
                decodeAudioData(dataView.buffer, obj, url);
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function () {
                    decodeAudioData(xhr.response, obj, url);
                };
                xhr.onerror = function () {
                    if (obj._webAudio) {
                        obj._buffer = true;
                        obj._webAudio = false;
                        obj._audioNode = [];
                        delete obj._gainNode;
                        delete cache[url];
                        obj.load();
                    }
                };
                try {
                    xhr.send();
                } catch (e) {
                    xhr.onerror();
                }
            }
        };
        var decodeAudioData = function (arraybuffer, obj, url) {
            ctx.decodeAudioData(arraybuffer, function (buffer) {
                if (buffer) {
                    cache[url] = buffer;
                    loadSound(obj, buffer);
                }
            }, function (err) {
                obj.on('loaderror');
            });
        };
        var loadSound = function (obj, buffer) {
            obj._duration = buffer ? buffer.duration : obj._duration;
            if (Object.getOwnPropertyNames(obj._sprite).length === 0) {
                obj._sprite = {
                    _default: [
                        0,
                        obj._duration * 1000
                    ]
                };
            }
            if (!obj._loaded) {
                obj._loaded = true;
                obj.on('load');
            }
            if (obj._autoplay) {
                obj.play();
            }
        };
        var refreshBuffer = function (obj, loop, id) {
            var node = obj._nodeById(id);
            node.bufferSource = ctx.createBufferSource();
            node.bufferSource.buffer = cache[obj._src];
            node.bufferSource.connect(node.panner);
            node.bufferSource.loop = loop[0];
            if (loop[0]) {
                node.bufferSource.loopStart = loop[1];
                node.bufferSource.loopEnd = loop[1] + loop[2];
            }
            node.bufferSource.playbackRate.value = obj._rate;
        };
    }
    return {
        Howler: Howler,
        Howl: Howl
    };
});'use strict';
define('ig/util', ['require'], function (require) {
    var DEG2RAD_OPERAND = Math.PI / 180;
    var RAD2DEG_OPERAND = 180 / Math.PI;
    var objectProto = Object.prototype;
    var exports = {};
    exports.noop = function () {
    };
    exports.getType = function (obj) {
        var cls = objectProto.toString.call(obj).slice(8, -1);
        return cls.toLowerCase();
    };
    exports.isType = function (type, obj) {
        var objectType = exports.getType(obj);
        return type.toLowerCase() === objectType;
    };
    exports.isWindow = function (obj) {
        return obj != null && obj === obj.window;
    };
    exports.isPlainObject = function (obj) {
        if (exports.getType(obj) !== 'object' || obj.nodeType || exports.isWindow(obj)) {
            return false;
        }
        if (obj.constructor && !{}.hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }
        return true;
    };
    exports.extend = function () {
        var options;
        var name;
        var src;
        var copy;
        var copyIsArray;
        var clone;
        var target = arguments[0] || {};
        var i = 1;
        var length = arguments.length;
        var deep = false;
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[i] || {};
            i++;
        }
        if (typeof target !== 'object' && !exports.isType('function', target)) {
            target = {};
        }
        if (i === length) {
            target = this;
            i--;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    if (options.hasOwnProperty(name)) {
                        src = target[name];
                        copy = options[name];
                        if (target === copy) {
                            continue;
                        }
                        if (deep && copy && (exports.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && Array.isArray(src) ? src : [];
                            } else {
                                clone = src && exports.isPlainObject(src) ? src : {};
                            }
                            target[name] = exports.extend(deep, clone, copy);
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }
        }
        return target;
    };
    exports.inherits = function (subClass, superClass) {
        var Empty = function () {
        };
        Empty.prototype = superClass.prototype;
        var selfPrototype = subClass.prototype;
        var proto = subClass.prototype = new Empty();
        for (var key in selfPrototype) {
            if (selfPrototype.hasOwnProperty(key)) {
                proto[key] = selfPrototype[key];
            }
        }
        subClass.prototype.constructor = subClass;
        subClass.superClass = superClass.prototype;
        return subClass;
    };
    exports.deg2Rad = function (deg) {
        return deg * DEG2RAD_OPERAND;
    };
    exports.rad2Deg = function (rad) {
        return rad * RAD2DEG_OPERAND;
    };
    exports.randomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    exports.randomFloat = function (min, max) {
        return Math.random() * (max - min) + min;
    };
    exports.removeArrByCondition = function (list, callback) {
        var candidateIndex = -1;
        var tmp;
        for (var i = 0, len = list.length; i < len; i++) {
            tmp = list[i];
            if (callback(tmp)) {
                candidateIndex = i;
                break;
            }
        }
        if (candidateIndex !== -1) {
            list.splice(candidateIndex, 1);
        }
    };
    exports.window2Canvas = function (canvas, x, y) {
        var boundRect = canvas.getBoundingClientRect();
        return {
            x: Math.round(x - boundRect.left * (canvas.width / boundRect.width)),
            y: Math.round(y - boundRect.top * (canvas.height / boundRect.height))
        };
    };
    exports.domWrap = function (curNode, newNode, newNodeId) {
        curNode.parentNode.insertBefore(newNode, curNode);
        newNode.appendChild(curNode);
        newNode.id = newNodeId || 'ig-create-dom-' + Date.now();
        return curNode;
    };
    exports.getElementOffset = function (element) {
        var x = element.offsetLeft;
        var y = element.offsetTop;
        while ((element = element.offsetParent) && element != document.body && element != document) {
            x += element.offsetLeft;
            y += element.offsetTop;
        }
        return {
            x: x,
            y: y
        };
    };
    return exports;
});'use strict';
define('ig/easing', ['require'], function (require) {
    var easing = {};
    easing.linear = function (t, b, c, d) {
        return c * t / d + b;
    };
    easing.easeInQuad = function (t, b, c, d) {
        return c * (t /= d) * t + b;
    };
    easing.easeOutQuad = function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    };
    easing.easeInOutQuad = function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * (--t * (t - 2) - 1) + b;
    };
    easing.easeInCubic = function (t, b, c, d) {
        return c * (t /= d) * t * t + b;
    };
    easing.easeOutCubic = function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    };
    easing.easeInOutCubic = function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    };
    easing.easeInQuart = function (t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    };
    easing.easeOutQuart = function (t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    };
    easing.easeInOutQuart = function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t + b;
        }
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    };
    easing.easeInQuint = function (t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    };
    easing.easeOutQuint = function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    };
    easing.easeInOutQuint = function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    };
    easing.easeInSine = function (t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    };
    easing.easeOutSine = function (t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    };
    easing.easeInOutSine = function (t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    };
    easing.easeInExpo = function (t, b, c, d) {
        return t === 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    };
    easing.easeOutExpo = function (t, b, c, d) {
        return t === d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    };
    easing.easeInOutExpo = function (t, b, c, d) {
        if (t === 0) {
            return b;
        }
        if (t === d) {
            return b + c;
        }
        if ((t /= d / 2) < 1) {
            return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        }
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    };
    easing.easeInCirc = function (t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    };
    easing.easeOutCirc = function (t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    };
    easing.easeInOutCirc = function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        }
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    };
    easing.easeInElastic = function (t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        if ((t /= d) === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        var s;
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    };
    easing.easeOutElastic = function (t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        if ((t /= d) === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        var s;
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    };
    easing.easeInOutElastic = function (t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        if ((t /= d / 2) === 2) {
            return b + c;
        }
        if (!p) {
            p = d * (0.3 * 1.5);
        }
        var s;
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        if (t < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    };
    easing.easeInBack = function (t, b, c, d, s) {
        if (s === void 0) {
            s = 1.70158;
        }
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    };
    easing.easeOutBack = function (t, b, c, d, s) {
        if (s === void 0) {
            s = 1.70158;
        }
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    };
    easing.easeInOutBack = function (t, b, c, d, s) {
        if (s === void 0) {
            s = 1.70158;
        }
        if ((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
        }
        return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    };
    easing.easeInBounce = function (t, b, c, d) {
        return c - easing.easeOutBounce(d - t, 0, c, d) + b;
    };
    easing.easeOutBounce = function (t, b, c, d) {
        if ((t /= d) < 1 / 2.75) {
            return c * (7.5625 * t * t) + b;
        } else if (t < 2 / 2.75) {
            return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
        } else if (t < 2.5 / 2.75) {
            return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
        }
        return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    };
    easing.easeInOutBounce = function (t, b, c, d) {
        if (t < d / 2) {
            return easing.easeInBounce(t * 2, 0, c, d) * 0.5 + b;
        }
        return easing.easeOutBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
    };
    return easing;
});'use strict';
define('ig/env', [
    'require',
    './ig'
], function (require) {
    var ig = require('./ig');
    function detect(ua) {
        var os = {};
        var browser = {};
        var webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/);
        var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        var osx = !!ua.match(/\(Macintosh\; Intel /);
        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
        var webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/);
        var wp = ua.match(/Windows Phone ([\d.]+)/);
        var touchpad = webos && ua.match(/TouchPad/);
        var kindle = ua.match(/Kindle\/([\d.]+)/);
        var silk = ua.match(/Silk\/([\d._]+)/);
        var blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/);
        var bb10 = ua.match(/(BB10).*Version\/([\d.]+)/);
        var rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/);
        var playbook = ua.match(/PlayBook/);
        var chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/);
        var firefox = ua.match(/Firefox\/([\d.]+)/);
        var ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/);
        var webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/);
        var safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/);
        var wechat = ua.match(/MicroMessenger\/([\d.]+)/);
        var baidu = ua.match(/baiduboxapp\/[^\/]+\/([\d.]+)_/) || ua.match(/baiduboxapp\/([\d.]+)/) || ua.match(/BaiduHD\/([\d.]+)/) || ua.match(/FlyFlow\/([\d.]+)/) || ua.match(/baidubrowser\/([\d.]+)/);
        var qq = ua.match(/MQQBrowser\/([\d.]+)/) || ua.match(/QQ\/([\d.]+)/);
        var uc = ua.match(/UCBrowser\/([\d.]+)/);
        var sogou = ua.match(/SogouMobileBrowser\/([\d.]+)/);
        var xiaomi = android && ua.match(/MiuiBrowser\/([\d.]+)/);
        var liebao = ua.match(/LBKIT/);
        var mercury = ua.match(/Mercury\/([\d.]+)/);
        if (browser.webkit = !!webkit) {
            browser.version = webkit[1];
        }
        if (android) {
            os.android = true;
            os.version = android[2];
        }
        if (iphone && !ipod) {
            os.ios = os.iphone = true;
            os.version = iphone[2].replace(/_/g, '.');
        }
        if (ipad) {
            os.ios = os.ipad = true;
            os.version = ipad[2].replace(/_/g, '.');
        }
        if (ipod) {
            os.ios = os.ipod = true;
            os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        }
        if (wp) {
            os.wp = true;
            os.version = wp[1];
        }
        if (webos) {
            os.webos = true;
            os.version = webos[2];
        }
        if (touchpad) {
            os.touchpad = true;
        }
        if (blackberry) {
            os.blackberry = true;
            os.version = blackberry[2];
        }
        if (bb10) {
            os.bb10 = true;
            os.version = bb10[2];
        }
        if (rimtabletos) {
            os.rimtabletos = true;
            os.version = rimtabletos[2];
        }
        if (playbook) {
            browser.playbook = true;
        }
        if (kindle) {
            os.kindle = true;
            os.version = kindle[1];
        }
        if (silk) {
            browser.silk = true;
            browser.version = silk[1];
        }
        if (!silk && os.android && ua.match(/Kindle Fire/)) {
            browser.silk = true;
        }
        if (chrome) {
            browser.chrome = true;
            browser.version = chrome[1];
        }
        if (firefox) {
            browser.firefox = true;
            browser.version = firefox[1];
        }
        if (ie) {
            browser.ie = true;
            browser.version = ie[1];
        }
        if (safari && (osx || os.ios)) {
            browser.safari = true;
            if (osx) {
                browser.version = safari[1];
            }
        }
        if (webview) {
            browser.webview = true;
        }
        if (wechat) {
            browser.wechat = true;
            browser.version = wechat[1];
        }
        if (baidu) {
            delete browser.webview;
            browser.baidu = true;
            browser.version = baidu[1];
        }
        if (qq) {
            browser.qq = true;
            browser.version = qq[1];
        }
        if (uc) {
            delete browser.webview;
            browser.uc = true;
            browser.version = uc[1];
        }
        if (sogou) {
            delete browser.webview;
            browser.sogou = true;
            browser.version = sogou[1];
        }
        if (xiaomi) {
            browser.xiaomi = true;
            browser.version = xiaomi[1];
        }
        if (liebao) {
            browser.liebao = true;
            browser.version = '0';
        }
        if (mercury) {
            browser.mercury = true;
            browser.version = mercury[1];
        }
        if (navigator.standalone) {
            browser.standalone = true;
        }
        os.tablet = !!(ipad || playbook || android && !ua.match(/Mobile/) || firefox && ua.match(/Tablet/) || ie && !ua.match(/Phone/) && ua.match(/Touch/));
        os.phone = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 || chrome && ua.match(/Android/) || chrome && ua.match(/CriOS\/([\d.]+)/) || firefox && ua.match(/Mobile/) || ie && ua.match(/Touch/)));
        return {
            browser: browser,
            os: os
        };
    }
    function checkAudio(exp) {
        exp.audioData = !!window.Audio;
        exp.webAudio = !!(window.AudioContext || window.webkitAudioContext);
        if (exp.webAudio) {
            if (typeof window.AudioContext !== 'undefined') {
                ig.audioContext = new window.AudioContext();
            } else {
                ig.audioContext = new window.webkitAudioContext();
            }
        }
        var audioElement = document.createElement('audio');
        try {
            if (audioElement.canPlayType) {
                if (audioElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')) {
                    exp.ogg = true;
                }
                if (audioElement.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '') || audioElement.canPlayType('audio/opus;').replace(/^no$/, '')) {
                    exp.opus = true;
                }
                if (audioElement.canPlayType('audio/mpeg;').replace(/^no$/, '')) {
                    exp.mp3 = true;
                }
                if (audioElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '')) {
                    exp.wav = true;
                }
                if (audioElement.canPlayType('audio/x-m4a;') || audioElement.canPlayType('audio/aac;').replace(/^no$/, '')) {
                    exp.m4a = true;
                }
                if (audioElement.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')) {
                    exp.webm = true;
                }
            }
        } catch (e) {
        }
    }
    var env = detect(navigator.userAgent);
    var exports = {
        browser: env.browser,
        os: env.os,
        supportOrientation: typeof window.orientation == 'number' && typeof window.onorientationchange == 'object',
        supportTouch: 'ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch,
        supportGeolocation: navigator.geolocation != null,
        isAndroid: env.os.android,
        isIOS: env.os.ios,
        isPhone: env.os.phone,
        isTablet: env.os.tablet,
        isMobile: env.os.phone || env.os.tablet
    };
    checkAudio(exports);
    return exports;
});'use strict';
define('ig/Event', ['require'], function (require) {
    var guidKey = '_observerGUID';
    function Event() {
        this._events = {};
    }
    Event.prototype = {
        constructor: Event,
        on: function (type, handler) {
            if (!this._events) {
                this._events = {};
            }
            var pool = this._events[type];
            if (!pool) {
                pool = this._events[type] = [];
            }
            if (!handler.hasOwnProperty(guidKey)) {
                handler[guidKey] = +new Date();
            }
            pool.push(handler);
            return this;
        },
        un: function (type, handler) {
            if (!this._events) {
                return;
            }
            if (!handler) {
                this._events[type] = [];
                return;
            }
            var pool = this._events[type];
            if (pool) {
                for (var i = 0; i < pool.length; i++) {
                    if (pool[i] === handler) {
                        pool.splice(i, 1);
                        i--;
                    }
                }
            }
            return this;
        },
        fire: function (type, event) {
            if (arguments.length === 1 && typeof type === 'object') {
                event = type;
                type = event.type;
            }
            var inlineHandler = this['on' + type];
            if (typeof inlineHandler === 'function') {
                inlineHandler.call(this, event);
            }
            if (!this._events) {
                return;
            }
            if (event == null) {
                event = {};
            }
            if (Object.prototype.toString.call(event) !== '[object Object]') {
                event = { data: event };
            }
            event.type = type;
            event.target = this;
            var alreadyInvoked = {};
            var pool = this._events[type];
            if (pool) {
                pool = pool.slice();
                for (var i = 0; i < pool.length; i++) {
                    var handler = pool[i];
                    if (!alreadyInvoked.hasOwnProperty(handler[guidKey])) {
                        handler.call(this, event);
                    }
                }
            }
            if (type !== '*') {
                var allPool = this._events['*'];
                if (!allPool) {
                    return;
                }
                allPool = allPool.slice();
                for (var i = 0; i < allPool.length; i++) {
                    var handler = allPool[i];
                    if (!alreadyInvoked.hasOwnProperty(handler[guidKey])) {
                        handler.call(this, event);
                    }
                }
            }
        },
        clearEvents: function () {
            this._events = {};
        },
        enable: function (target) {
            target._events = {};
            target.on = Event.prototype.on;
            target.un = Event.prototype.un;
            target.fire = Event.prototype.fire;
        }
    };
    return Event;
});'use strict';
define('ig/Vector', ['require'], function (require) {
    var sqrt = Math.sqrt;
    var pow = Math.pow;
    function Vector(x, y) {
        this.x = x || 0;
        this.y = y || x || 0;
    }
    Vector.prototype = {
        constructor: Vector,
        normalize: function () {
            var m = this.getMagnitude();
            if (m !== 0) {
                this.x /= m;
                this.y /= m;
            }
            return this;
        },
        getMagnitude: function () {
            return sqrt(pow(this.x, 2) + pow(this.y, 2));
        },
        add: function (other, isNew) {
            var x = this.x + other.x;
            var y = this.y + other.y;
            if (isNew) {
                return new Vector(x, y);
            }
            this.x = x;
            this.y = y;
            return this;
        },
        sub: function (other, isNew) {
            var x = this.x - other.x;
            var y = this.y - other.y;
            if (isNew) {
                return new Vector(x, y);
            }
            this.x = x;
            this.y = y;
            return this;
        },
        dot: function (other) {
            return this.x * other.x + this.y * other.y;
        },
        edge: function (other) {
            return this.sub(other, true);
        },
        perpendicular: function (isNew) {
            var x = -this.x;
            var y = this.y;
            if (isNew) {
                return new Vector(x, y);
            }
            this.x = x;
            this.y = y;
            return this;
        },
        normal: function () {
            return this.perpendicular(true).normalize();
        }
    };
    return Vector;
});'use strict';
define('ig/Animation', [
    'require',
    './ig',
    './util',
    './Event',
    './easing'
], function (require) {
    var ig = require('./ig');
    var util = require('./util');
    var Event = require('./Event');
    var easing = require('./easing');
    var GUID_KEY = 0;
    function Animation(opts) {
        util.extend(true, this, {
            name: GUID_KEY++,
            source: {},
            target: null,
            range: null,
            tween: easing.linear,
            repeat: false,
            duration: 1000,
            jumpFrames: 0
        }, opts);
        this.setup();
        return this;
    }
    Animation.prototype = {
        constructor: Animation,
        setup: function () {
            this.paused = false;
            this.repeatCount = 0;
            this.curFrame = 0;
            this.curState = {};
            this.initState = {};
            this.frames = Math.ceil(this.duration * ig.STANDARD_FPS / 1000);
            var source = this.source;
            var target = this.target;
            var range = this.range;
            var numericSourceVal = 0;
            var numericRangeVal = 0;
            if (range) {
                for (var j in range) {
                    if (range.hasOwnProperty(j)) {
                        numericSourceVal = parseFloat(source[j]);
                        numericRangeVal = parseFloat(range[j]);
                        this.curState[j] = {
                            from: parseFloat(numericSourceVal - numericRangeVal),
                            cur: numericSourceVal,
                            to: parseFloat(numericSourceVal + numericRangeVal)
                        };
                    }
                }
                return this;
            }
            if (util.getType(target) !== 'array') {
                for (var k in target) {
                    if (target.hasOwnProperty(k)) {
                        this.initState[k] = this.curState[k] = {
                            from: parseFloat(source[k]),
                            cur: parseFloat(source[k]),
                            to: parseFloat(target[k])
                        };
                    }
                }
                return this;
            }
            this.animIndex = 0;
            this.animLength = target.length;
            for (var m = 0; m < this.animLength; m++) {
                for (var i in target[m]) {
                    if (target[m].hasOwnProperty(i)) {
                        if (m === 0) {
                            this.curState[i] = {
                                from: parseFloat(source[i]),
                                cur: parseFloat(source[i]),
                                to: parseFloat(target[m][i])
                            };
                        }
                        this.initState[i] = {
                            from: parseFloat(source[i]),
                            cur: parseFloat(source[i]),
                            to: parseFloat(target[m][i])
                        };
                    }
                }
            }
            return this;
        },
        play: function () {
            if (this.requestID) {
                this.stop();
            }
            this.paused = false;
            var me = this;
            ig.loop({
                step: function (dt, requestID) {
                    me.step.call(me, dt, requestID);
                },
                jumpFrames: me.jumpFrames
            });
            return this;
        },
        stop: function () {
            window.cancelAnimationFrame(this.requestID);
            return this;
        },
        destroy: function () {
            this.stop();
            this.clearEvents();
        },
        togglePause: function () {
            this.paused = !this.paused;
            return this;
        },
        pause: function () {
            this.paused = true;
            return this;
        },
        resume: function () {
            this.paused = false;
            return this;
        },
        next: function () {
            this.stop();
            this.curFrame++;
            this.curFrame = this.curFrame > this.frames ? this.frames : this.curFrame;
            var me = this;
            ig.loop({
                step: function (dt, requestID) {
                    me.step.call(me, dt, requestID);
                },
                jumpFrames: me.jumpFrames
            });
            return this;
        },
        prev: function () {
            this.stop();
            this.curFrame--;
            this.curFrame = this.curFrame < 0 ? 0 : this.curFrame;
            var me = this;
            ig.loop({
                step: function (dt, requestID) {
                    me.step.call(me, dt, requestID);
                },
                jumpFrames: me.jumpFrames
            });
            return this;
        },
        gotoAndPlay: function (frame) {
            this.stop();
            this.curFrame = frame;
            this.play.call(this);
            return this;
        },
        gotoAndStop: function (frame) {
            this.stop();
            this.curFrame = frame;
            return this;
        },
        swapFromTo: function () {
            this.curFrame = 0;
            this.curState = {};
            if (util.getType(this.target) === 'array') {
                this.target.reverse();
                this.animIndex = 0;
                this.animLength = this.target.length;
                for (var i in this.target[this.animIndex]) {
                    if (this.repeatCount % 2 === 0) {
                        this.curState[i] = {
                            from: this.initState[i].from,
                            cur: this.initState[i].cur,
                            to: this.initState[i].to
                        };
                    } else {
                        this.curState[i] = {
                            from: this.initState[i].to,
                            cur: this.initState[i].to,
                            to: this.initState[i].from
                        };
                    }
                }
            } else {
                for (var j in this.target) {
                    if (this.repeatCount % 2 === 0) {
                        this.curState[j] = {
                            from: this.initState[j].from,
                            cur: this.initState[j].cur,
                            to: this.initState[j].to
                        };
                    } else {
                        this.curState[j] = {
                            from: this.initState[j].to,
                            cur: this.initState[j].to,
                            to: this.initState[j].from
                        };
                    }
                }
            }
            return this;
        },
        step: function (dt, requestID) {
            var me = this;
            me.requestID = requestID;
            me.fire('step', {
                data: {
                    source: me.source,
                    animInstance: me
                }
            });
            var ds;
            for (var i in me.curState) {
                if (me.curState.hasOwnProperty(i)) {
                    ds = me.tween(me.curFrame, me.curState[i].cur, me.curState[i].to - me.curState[i].cur, me.frames).toFixed(2);
                    me.source[i] = parseFloat(ds);
                }
            }
            me.curFrame++;
            if (me.curFrame < me.frames) {
                return;
            }
            if (me.range && !me.rangeExec) {
                me.curFrame = 0;
                for (var j in me.curState) {
                    if (me.curState.hasOwnProperty(j)) {
                        me.curState[j] = {
                            from: me.curState[j].to,
                            cur: me.curState[j].to,
                            to: me.curState[j].from
                        };
                    }
                }
                if (!me.repeat) {
                    me.rangeExec = true;
                } else {
                    me.repeatCount++;
                    if (me.repeatCount % 2 === 0) {
                        me.fire('repeat', {
                            data: {
                                source: me.source,
                                animInstance: me,
                                repeatCount: me.repeatCount / 2
                            }
                        });
                    }
                }
            } else {
                if (me.animLength) {
                    me.fire('groupComplete', {
                        data: {
                            source: me.source,
                            animInstance: me
                        }
                    });
                    if (me.animIndex < me.animLength - 1) {
                        me.animIndex++;
                        me.curFrame = 0;
                        me.curState = {};
                        var flag = me.repeatCount % 2 === 0;
                        for (var k in me.target[me.animIndex]) {
                            if (me.target[me.animIndex].hasOwnProperty(k)) {
                                me.curState[k] = {
                                    from: flag ? me.initState[k].from : me.initState[k].to,
                                    cur: flag ? me.initState[k].cur : me.initState[k].to,
                                    to: flag ? me.initState[k].to : me.initState[k].from
                                };
                            }
                        }
                    } else {
                        if (me.repeat) {
                            me.repeatCount++;
                            me.swapFromTo();
                            me.fire('repeat', {
                                data: {
                                    source: me.source,
                                    animInstance: me,
                                    repeatCount: me.repeatCount
                                }
                            });
                        } else {
                            me.stop();
                            me.paused = false;
                            me.fire('complete', {
                                data: {
                                    source: me.source,
                                    animInstance: me
                                }
                            });
                        }
                    }
                } else {
                    if (me.repeat) {
                        me.repeatCount++;
                        me.swapFromTo();
                        me.fire('repeat', {
                            data: {
                                source: me.source,
                                animInstance: me,
                                repeatCount: me.repeatCount
                            }
                        });
                    } else {
                        me.stop();
                        me.paused = false;
                        me.fire('complete', {
                            data: {
                                source: me.source,
                                animInstance: me
                            }
                        });
                    }
                }
            }
        }
    };
    util.inherits(Animation, Event);
    return Animation;
});
var ig = require('ig');


var modName = 'ig/dep/howler';
var refName = '';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/util';
var refName = 'util';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/easing';
var refName = 'easing';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/env';
var refName = 'env';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/Event';
var refName = '';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/Vector';
var refName = 'Vector';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}

var modName = 'ig/Animation';
var refName = 'Animation';
var folderName = '';

var tmp;
if (folderName) {
    if (!ig[folderName]) {
        tmp = {};
        tmp[refName] = require(modName);
        ig[folderName] = tmp;
    }
    else {
        ig[folderName][refName] = require(modName);
    }
}
else {
    tmp = require(modName);
    if (refName) {
        ig[refName] = tmp;
    }
}


_global['ig'] = ig;

})(window);
