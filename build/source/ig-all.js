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
    './util',
    './config'
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
    var config = require('./config');
    var exports = {};
    exports.setConfig = config.setConfig;
    exports.getConfig = config.getConfig;
    exports.setConfig('status', {
        NORMAL: 1,
        NOT_RENDER: 2,
        NOT_UPDATE: 3,
        NOT_RU: 4,
        DESTROYED: 5
    });
    exports.setConfig('width', 383);
    exports.setConfig('height', 550);
    exports.setConfig('maxWidth', 5000);
    exports.setConfig('maxHeight', 5000);
    exports.setConfig('fps', 60);
    exports.loop = function (opts) {
        var conf = util.extend(true, {}, {
            step: util.noop,
            exec: util.noop,
            jumpFrames: 0
        }, opts);
        var fps = exports.getConfig('fps') || 60;
        var dt = 1000 / fps;
        var requestID;
        var passed = 0;
        var frameUpdateCount = 0;
        var now;
        var then = Date.now();
        var acc = 0;
        var stepCount = 0;
        var execCount = 0;
        var _jumpFrames = conf.jumpFrames === 0 ? 1 : conf.jumpFrames;
        (function tick() {
            requestID = window.requestAnimationFrame(tick);
            frameUpdateCount++;
            if (frameUpdateCount > conf.jumpFrames) {
                frameUpdateCount = 0;
                now = Date.now();
                passed = now - then;
                then = now;
                acc += passed;
                if (passed <= 1000 * _jumpFrames) {
                    while (acc >= dt * _jumpFrames) {
                        stepCount++;
                        conf.step(dt * (fps / 1000), stepCount, requestID);
                        acc -= dt * _jumpFrames;
                    }
                    execCount++;
                    conf.exec(execCount);
                } else {
                    acc -= passed;
                }
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
    if (typeof window !== 'undefined') {
        window.Howler = Howler;
        window.Howl = Howl;
    }
    return {
        Howler: Howler,
        Howl: Howl
    };
});define('ig/config', ['require'], function (require) {
    var config = {};
    var exports = {};
    exports.setConfig = function (key, value) {
        if (key) {
            config[key] = value;
        }
        return config;
    };
    exports.getConfig = function (key) {
        if (!key) {
            return config;
        }
        return config[key];
    };
    return exports;
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
    exports.throttle = function (func, wait, options) {
        var context;
        var args;
        var result;
        var timeout = null;
        var previous = 0;
        if (!options) {
            options = {};
        }
        var later = function () {
            previous = options.leading === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) {
                context = args = null;
            }
        };
        return function () {
            var now = Date.now();
            if (!previous && options.leading === false) {
                previous = now;
            }
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                if (!timeout) {
                    context = args = null;
                }
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };
    exports.debounce = function (func, wait, immediate) {
        var timeout;
        var args;
        var context;
        var timestamp;
        var result;
        var later = function () {
            var last = Date.now() - timestamp;
            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) {
                        context = args = null;
                    }
                }
            }
        };
        return function () {
            context = this;
            args = arguments;
            timestamp = Date.now();
            var callNow = immediate && !timeout;
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }
            return result;
        };
    };
    exports.getImgAsset = function (img, gameAsset, gameResource) {
        if (gameAsset[img]) {
            return gameAsset[img];
        }
        for (var i = 0, len = gameResource.length; i < len; i++) {
            if (exports.getType(gameResource[i]) === 'string' && gameResource[i] === img) {
                return gameResource[i];
            }
            if (exports.getType(gameResource[i]) === 'object' && gameResource[i].src === img) {
                return gameAsset[gameResource[i].id];
            }
        }
        return null;
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
    var isSupportLocalStorage = function () {
        try {
            var support = 'localStorage' in window && window['localStorage'] !== null;
            var test = {
                k: 'test key',
                v: 'test value'
            };
            if (support) {
                localStorage.setItem(test.k, test.v);
                support = test.v === localStorage.getItem(test.k);
                localStorage.removeItem(test.k);
            }
            return support;
        } catch (e) {
            return false;
        }
    }();
    var env = detect(navigator.userAgent);
    var exports = {
        browser: env.browser,
        os: env.os,
        supportOrientation: typeof window.orientation === 'number' && typeof window.onorientationchange === 'object',
        supportTouch: 'ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch,
        supportGeolocation: navigator.geolocation != null,
        supportLocalStorage: isSupportLocalStorage,
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
define('ig/Matrix', [
    'require',
    './util'
], function (require) {
    var util = require('./util');
    var cos = Math.cos;
    var sin = Math.sin;
    function Matrix() {
        this.m = [
            1,
            0,
            0,
            1,
            0,
            0
        ];
        return this;
    }
    Matrix.prototype = {
        constructor: Matrix,
        reset: function () {
            this.m = [
                1,
                0,
                0,
                1,
                0,
                0
            ];
            return this;
        },
        mul: function (matrix) {
            var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
            var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];
            var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
            var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];
            var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
            var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];
            this.m[0] = m11;
            this.m[1] = m12;
            this.m[2] = m21;
            this.m[3] = m22;
            this.m[4] = dx;
            this.m[5] = dy;
            return this;
        },
        invert: function () {
            var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
            var m0 = this.m[3] * d;
            var m1 = -this.m[1] * d;
            var m2 = -this.m[2] * d;
            var m3 = this.m[0] * d;
            var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
            var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
            this.m[0] = m0;
            this.m[1] = m1;
            this.m[2] = m2;
            this.m[3] = m3;
            this.m[4] = m4;
            this.m[5] = m5;
            return this;
        },
        rotate: function (angle) {
            var rad = util.deg2Rad(angle);
            var c = cos(rad);
            var s = sin(rad);
            var m11 = this.m[0] * c + this.m[2] * s;
            var m12 = this.m[1] * c + this.m[3] * s;
            var m21 = this.m[0] * -s + this.m[2] * c;
            var m22 = this.m[1] * -s + this.m[3] * c;
            this.m[0] = m11;
            this.m[1] = m12;
            this.m[2] = m21;
            this.m[3] = m22;
            return this;
        },
        translate: function (x, y) {
            this.m[4] += this.m[0] * x + this.m[2] * y;
            this.m[5] += this.m[1] * x + this.m[3] * y;
            return this;
        },
        scale: function (sx, sy) {
            this.m[0] *= sx;
            this.m[1] *= sx;
            this.m[2] *= sy;
            this.m[3] *= sy;
            return this;
        },
        transformPoint: function (px, py) {
            var x = px;
            var y = py;
            px = x * this.m[0] + y * this.m[2] + this.m[4];
            py = x * this.m[1] + y * this.m[3] + this.m[5];
            return {
                x: px,
                y: py
            };
        },
        setCtxTransform: function (ctx) {
            var m = this.m;
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }
    };
    return Matrix;
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
    var CONFIG = ig.getConfig();
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
            this.frames = Math.ceil(this.duration * (CONFIG.fps || 60) / 1000);
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
                step: function (dt, stepCount, requestID) {
                    if (me.requestID === null) {
                        return;
                    }
                    me.step.call(me, dt, stepCount, requestID);
                },
                jumpFrames: me.jumpFrames
            });
            return this;
        },
        stop: function () {
            window.cancelAnimationFrame(this.requestID);
            this.requestID = null;
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
                step: function (dt, stepCount, requestID) {
                    if (me.requestID === null) {
                        return;
                    }
                    me.step.call(me, dt, stepCount, requestID);
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
                step: function (dt, stepCount, requestID) {
                    if (me.requestID === null) {
                        return;
                    }
                    me.step.call(me, dt, stepCount, requestID);
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
        step: function (dt, stepCount, requestID) {
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
            if (me.curFrame <= me.frames) {
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
});'use strict';
define('ig/DisplayObject', [
    'require',
    './ig',
    './Event',
    './util',
    './Animation',
    './Matrix'
], function (require) {
    var ig = require('./ig');
    var Event = require('./Event');
    var util = require('./util');
    var Animation = require('./Animation');
    var Matrix = require('./Matrix');
    var CONFIG = ig.getConfig();
    var STATUS = CONFIG.status;
    var GUID_KEY = 0;
    function DisplayObject(opts) {
        util.extend(true, this, {
            name: 'ig_displayobject_' + GUID_KEY++,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            cx: 0,
            cy: 0,
            radius: 0,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            alpha: 1,
            zIndex: 0,
            fillStyle: 'transparent',
            strokeStyle: 'transparent',
            image: null,
            vx: 0,
            vy: 0,
            ax: 0,
            ay: 0,
            frictionX: 1,
            frictionY: 1,
            children: [],
            followParent: 1,
            parent: null,
            status: STATUS.NORMAL,
            mouseEnable: false,
            captureFunc: util.noop,
            moveFunc: util.noop,
            releaseFunc: util.noop,
            debug: false
        }, opts);
        this._ = {};
        this.matrix = new Matrix();
        this.setPosX(this.x);
        this.setPosY(this.y);
        return this;
    }
    DisplayObject.prototype = {
        constructor: DisplayObject,
        setMatrix: function (m) {
            this.matrix.m = m;
            return this;
        },
        setStatus: function (status) {
            this.status = status || this.status;
            var children = this.children;
            for (var i = 0, len = children.length; i < len; i++) {
                children[i].status = this.status;
            }
            return this;
        },
        setCaptureFunc: function (func) {
            this.captureFunc = func || util.noop;
            return this;
        },
        setMoveFunc: function (func) {
            this.moveFunc = func || util.noop;
            return this;
        },
        setReleaseFunc: function (func) {
            this.releaseFunc = func || util.noop;
            return this;
        },
        setPosX: function (x) {
            this.x = x || this.x;
            return this;
        },
        setPosY: function (y) {
            this.y = y || this.y;
            return this;
        },
        setPos: function (x, y) {
            this.x = x || this.x;
            this.y = y || this.y;
            return this;
        },
        setAccelerationX: function (ax) {
            this.ax = ax || this.ax;
            return this;
        },
        setAccelerationY: function (ay) {
            this.ay = ay || this.ay;
            return this;
        },
        setAcceleration: function (ax, ay) {
            this.ax = ax || this.ax;
            this.ay = ay || this.ay;
            return this;
        },
        setFrictionX: function (frictionX) {
            this.frictionX = frictionX || this.frictionX;
            return this;
        },
        setFrictionY: function (frictionY) {
            this.frictionY = frictionY || this.frictionY;
            return this;
        },
        setFriction: function (frictionX, frictionY) {
            this.frictionX = frictionX || this.frictionX;
            this.frictionY = frictionY || this.frictionY;
            return this;
        },
        setScaleX: function (scaleX) {
            this.scaleX = scaleX || this.scaleX;
            return this;
        },
        setScaleY: function (scaleY) {
            this.scaleY = scaleY || this.scaleY;
            return this;
        },
        setScale: function (scaleX, scaleY) {
            this.scaleX = scaleX || this.scaleX;
            this.scaleY = scaleY || this.scaleY;
            return this;
        },
        rotate: function (angle) {
            var ctx = this.stage.ctx;
            ctx.save();
            ctx.rotate(util.deg2Rad(angle || this.angle || 0));
            ctx.restore();
            return this;
        },
        setAnimate: function (opts) {
            var me = this;
            var animOpts = util.extend(true, {}, { source: me }, opts);
            var stepFunc = util.getType(animOpts.stepFunc) === 'function' ? animOpts.stepFunc : util.noop;
            var repeatFunc = util.getType(animOpts.repeatFunc) === 'function' ? animOpts.repeatFunc : util.noop;
            var groupCompleteFunc = util.getType(animOpts.groupCompleteFunc) === 'function' ? animOpts.groupCompleteFunc : util.noop;
            var completeFunc = util.getType(animOpts.completeFunc) === 'function' ? animOpts.completeFunc : util.noop;
            this.animate = new Animation(animOpts).play().on('step', function (d) {
                stepFunc(d);
            }).on('repeat', function (d) {
                repeatFunc(d);
            }).on('groupComplete', function (d) {
                groupCompleteFunc(d);
            }).on('complete', function (d) {
                completeFunc(d);
            });
            return this;
        },
        stopAnimate: function () {
            this.animate && this.animate.stop();
            return this;
        },
        destroyAnimate: function () {
            this.animate && this.animate.destroy();
            return this;
        },
        destroy: function () {
            this.status = STATUS.DESTROYED;
        },
        move: function (x, y) {
            this.x = x || this.x;
            this.y = y || this.y;
            return this;
        },
        hitTestPoint: function (x, y) {
            return false;
        },
        _step: function (dt, stepCount, requestID) {
            return this;
        },
        step: function (dt, stepCount, requestID) {
            return this;
        },
        render: function (ctx) {
            return this;
        }
    };
    util.inherits(DisplayObject, Event);
    return DisplayObject;
});'use strict';
define('ig/Text', [
    'require',
    './util',
    './DisplayObject'
], function (require) {
    var util = require('./util');
    var DisplayObject = require('./DisplayObject');
    function Text(opts) {
        DisplayObject.call(this, opts);
        util.extend(true, this, {
            content: '',
            size: 30,
            isBold: false,
            fontFamily: 'sans-serif',
            useCache: true
        }, opts);
        var obj = measureText(this.content, this.isBold, this.fontFamily, this.size);
        this.bounds = {
            x: this.x,
            y: this.y,
            width: obj.width,
            height: obj.height,
            realWidth: obj.width,
            realHeight: obj.height
        };
        if (this.width !== 0) {
            this.bounds.width = this.width;
        }
        if (this.height !== 0) {
            this.bounds.height = this.height;
        }
        this.width = this.bounds.width;
        this.height = this.bounds.height;
        this.font = '' + (this.isBold ? 'bold ' : '') + this.size + 'pt ' + this.fontFamily;
        if (this.useCache) {
            this.initCacheCanvas();
        }
        return this;
    }
    Text.prototype = {
        constructor: Text,
        initCacheCanvas: function () {
            if (!this.cacheCanvas) {
                this.cacheCanvas = document.createElement('canvas');
                this.cacheCtx = this.cacheCanvas.getContext('2d');
            }
            this.cacheCanvas.width = this.bounds.width;
            this.cacheCanvas.height = this.bounds.height;
            this.cache();
            return this;
        },
        cache: function () {
            this.cacheCtx.save();
            this.cacheCtx.fillStyle = this.fillStyle;
            this.cacheCtx.globalAlpha = this.alpha;
            this.cacheCtx.font = this.font;
            this.cacheCtx.fillText(this.content, this.bounds.width / 2 - this.bounds.realWidth / 2, this.bounds.height - 2);
            this.cacheCtx.restore();
            return this;
        },
        generatePoints: function () {
            this.points = [
                {
                    x: this.bounds.x,
                    y: this.bounds.y
                },
                {
                    x: this.bounds.x + this.bounds.width,
                    y: this.bounds.y
                },
                {
                    x: this.bounds.x + this.bounds.width,
                    y: this.bounds.y + this.bounds.height
                },
                {
                    x: this.bounds.x,
                    y: this.bounds.y + this.bounds.height
                }
            ];
            for (var i = 0, len = this.points.length; i < len; i++) {
                var transformPoint = this.matrix.transformPoint(this.points[i].x, this.points[i].y);
                this.points[i] = {
                    x: transformPoint.x,
                    y: transformPoint.y
                };
            }
            this.cx = this.bounds.x + this.bounds.width / 2;
            this.cy = this.bounds.y + this.bounds.height / 2;
            return this;
        },
        createPath: function (ctx) {
            var points = this.points;
            var len = points.length;
            if (!len) {
                return;
            }
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (var i = 0; i < len; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            return this;
        },
        isPointInPath: function (ctx, x, y) {
            this.createPath(ctx);
            return ctx.isPointInPath(x, y);
        },
        hitTestPoint: function (x, y) {
            var stage = this.stage;
            return this.isPointInPath(stage.ctx, x, y);
        },
        changeContent: function (content) {
            this.content = content;
            var obj = measureText(this.content, this.isBold, this.fontFamily, this.size);
            this.bounds = {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                realWidth: obj.width,
                realHeight: obj.height
            };
            this.initCacheCanvas();
            return this;
        },
        getContent: function () {
            return this.content;
        },
        move: function (x, y) {
            this.x = this.bounds.x = x;
            this.y = this.bounds.y = y;
            this.generatePoints();
            return this;
        },
        render: function (ctx, execCount) {
            ctx.save();
            ctx.fillStyle = this.fillStyle;
            ctx.globalAlpha = this.alpha;
            ctx.font = this.font;
            if (!this.parent || !this.followParent) {
                this.matrix.reset();
                this.matrix.translate(this.cx, this.cy);
                this.matrix.rotate(this.angle);
                this.matrix.scale(this.scaleX, this.scaleY);
                this.matrix.translate(-this.cx, -this.cy);
            }
            this.matrix.setCtxTransform(ctx);
            this.generatePoints();
            if (this.useCache) {
                ctx.drawImage(this.cacheCanvas, this.bounds.x, this.bounds.y);
            } else {
                ctx.fillText(this.content, this.x + this.bounds.width / 2 - this.bounds.realWidth / 2, this.bounds.y + this.bounds.height - 2);
            }
            this.debugRender(ctx);
            ctx.restore();
            return this;
        },
        debugRender: function (ctx) {
            if (this.debug) {
                ctx.save();
                ctx.strokeStyle = '#0f0';
                ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
                ctx.restore();
            }
        }
    };
    function measureText(text, isBold, fontFamily, size) {
        var div = document.createElement('div');
        div.innerHTML = text;
        div.style.position = 'absolute';
        div.style.top = '-1000px';
        div.style.left = '-1000px';
        div.style.fontFamily = fontFamily;
        div.style.fontWeight = isBold ? 'bold' : 'normal';
        div.style.fontSize = size + 'pt';
        document.body.appendChild(div);
        var ret = {
            width: div.offsetWidth,
            height: div.offsetHeight
        };
        document.body.removeChild(div);
        return ret;
    }
    util.inherits(Text, DisplayObject);
    return Text;
});'use strict';
define('ig/Bitmap', [
    'require',
    './util',
    './Rectangle'
], function (require) {
    var util = require('./util');
    var Rectangle = require('./Rectangle');
    function Bitmap(opts) {
        opts = opts || {};
        if (!opts.image && !opts.asset) {
            throw new Error('Bitmap must be require a image param');
        }
        Rectangle.call(this, opts);
        util.extend(true, this, {
            sx: 0,
            sy: 0,
            sWidth: 0,
            sHeight: 0,
            useCache: true
        }, opts);
        return this;
    }
    Bitmap.prototype = {
        constructor: Bitmap,
        initCacheCanvas: function () {
            if (!this.cacheCanvas) {
                this.cacheCanvas = document.createElement('canvas');
                this.cacheCtx = this.cacheCanvas.getContext('2d');
            }
            this.cacheCanvas.width = this.width;
            this.cacheCanvas.height = this.height;
            this.cache();
            return this;
        },
        cache: function () {
            this.cacheCtx.save();
            this.cacheCtx.drawImage(this.asset, this.sx, this.sy, this.sWidth, this.sHeight, 0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
            this.cacheCtx.restore();
            return this;
        },
        change: function (prop) {
            prop = prop || {};
            util.extend(this, {
                asset: this.asset,
                x: this.x,
                y: this.y,
                sx: this.sx,
                sy: this.sy,
                sWidth: this.sWidth,
                sHeight: this.sHeight
            }, prop);
            this._.isInitDimension = false;
            _setInitDimension.call(this);
            this.initCacheCanvas();
            return this;
        },
        render: function (ctx) {
            _setInitDimension.call(this);
            ctx.save();
            ctx.fillStyle = this.fillStyle;
            ctx.strokeStyle = this.strokeStyle;
            ctx.globalAlpha = this.alpha;
            Bitmap.superClass.render.apply(this, arguments);
            this.matrix.setCtxTransform(ctx);
            if (this.useCache) {
                if (!this._.execCache) {
                    this._.execCache = true;
                    this.initCacheCanvas();
                }
                ctx.drawImage(this.cacheCanvas, this.x, this.y);
            } else {
                ctx.drawImage(this.asset, this.sx, this.sy, this.sWidth, this.sHeight, this.x, this.y, this.width, this.height);
            }
            ctx.restore();
            return this;
        }
    };
    function _setInitDimension() {
        if (!this._.isInitDimension) {
            this._.isInitDimension = true;
            if (this.width === 0) {
                this.width = this.asset.width;
            }
            if (this.sWidth === 0) {
                this.sWidth = this.asset.width;
            }
            if (this.height === 0) {
                this.height = this.asset.height;
            }
            if (this.sHeight === 0) {
                this.sHeight = this.asset.height;
            }
        }
    }
    util.inherits(Bitmap, Rectangle);
    return Bitmap;
});'use strict';
define('ig/BitmapPolygon', [
    'require',
    './util',
    './Polygon'
], function (require) {
    var util = require('./util');
    var Polygon = require('./Polygon');
    function BitmapPolygon(opts) {
        opts = opts || {};
        if (!opts.image) {
            throw new Error('BitmapPolygon must be require a image param');
        }
        Polygon.call(this, opts);
        util.extend(true, this, {
            sx: 0,
            sy: 0,
            sWidth: 0,
            sHeight: 0,
            useCache: true
        }, opts);
        this.getOriginBounds();
        return this;
    }
    BitmapPolygon.prototype = {
        constructor: BitmapPolygon,
        initCacheCanvas: function () {
            if (!this.cacheCanvas) {
                this.cacheCanvas = document.createElement('canvas');
                this.cacheCtx = this.cacheCanvas.getContext('2d');
            }
            this.cacheCanvas.width = this.width;
            this.cacheCanvas.height = this.height;
            this.cache();
            return this;
        },
        cache: function () {
            this.cacheCtx.save();
            this.cacheCtx.drawImage(this.asset, this.sx, this.sy, this.sWidth, this.sHeight, 0, 0, this.width, this.height);
            this.cacheCtx.restore();
            return this;
        },
        render: function (ctx) {
            _setInitDimension.call(this);
            ctx.save();
            ctx.fillStyle = this.fillStyle;
            ctx.strokeStyle = this.strokeStyle;
            ctx.globalAlpha = this.alpha;
            BitmapPolygon.superClass.render.apply(this, arguments);
            this.matrix.setCtxTransform(ctx);
            if (this.useCache) {
                if (!this._.execCache) {
                    this._.execCache = true;
                    this.initCacheCanvas();
                }
                ctx.drawImage(this.cacheCanvas, this.x, this.y);
            } else {
                ctx.drawImage(this.asset, this.sx, this.sy, this.sWidth, this.sHeight, this.x, this.y, this.width, this.height);
            }
            this.generatePoints();
            this.getBounds();
            this.createPath(ctx);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            this.debugRender(ctx);
            return this;
        }
    };
    function _setInitDimension() {
        if (!this._.isInitDimension) {
            this._.isInitDimension = true;
            if (this.width === 0) {
                this.width = this.asset.width;
            }
            if (this.height === 0) {
                this.height = this.asset.height;
            }
            if (this.sWidth === 0) {
                this.sWidth = this.asset.width;
            }
            if (this.sHeight === 0) {
                this.sHeight = this.asset.height;
            }
        }
    }
    util.inherits(BitmapPolygon, Polygon);
    return BitmapPolygon;
});'use strict';
define('ig/SpriteSheet', [
    'require',
    './util',
    './Rectangle'
], function (require) {
    var util = require('./util');
    var Rectangle = require('./Rectangle');
    var STATUS = ig.getConfig('status');
    var floor = Math.floor;
    function SpriteSheet(opts) {
        opts = opts || {};
        if (!opts.image && !opts.asset) {
            throw new Error('SpriteSheet must be require a image param');
        }
        Rectangle.apply(this, opts);
        util.extend(this, {
            jumpFrames: 0,
            isOnceDestroyed: false,
            onceDestroyedDone: util.noop,
            isOnce: false,
            onceDone: util.noop
        }, opts);
        this.frameUpdateCount = 0;
        this.frameIndex = 0;
        return this;
    }
    SpriteSheet.prototype = {
        constructor: SpriteSheet,
        change: function (prop) {
            prop = prop || {};
            util.extend(this, {
                asset: this.asset,
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                total: 1,
                sx: 0,
                sy: 0,
                cols: 1,
                rows: 1,
                tileW: this.tileW,
                tileH: this.tileH,
                offsetX: this.offsetX,
                offsetY: this.offsetY,
                jumpFrames: this.jumpFrames,
                isOnceDestroyed: false,
                onceDestroyedDone: util.noop,
                isOnce: false,
                onceDone: util.noop
            }, prop);
            this.frameUpdateCount = 0;
            this.frameIndex = 0;
            this.originalSX = this.sx;
            this.originalTotal = this.total;
            this.realCols = floor(this.cols - this.sx / this.tileW);
            this.width = this.width || this.tileW;
            this.height = this.height || this.tileH;
            return this;
        },
        _step: function (dt, stepCount, requestID) {
            this.frameUpdateCount++;
            if (this.frameUpdateCount > this.jumpFrames) {
                this.frameUpdateCount = 0;
                if (this.frameIndex < this.total - 1) {
                    this.frameIndex++;
                } else {
                    this.frameIndex = 0;
                    this.total = this.originalTotal;
                    this.sx = this.originalSX;
                    this.realCols = floor(this.cols - this.originalSX / this.tileW);
                    this.sy -= (this.rows - 1) * this.tileH;
                    if (this.isOnceDestroyed) {
                        this.status = STATUS.DESTROYED;
                        if (util.getType(this.onceDestroyedDone) === 'function') {
                            var me = this;
                            setTimeout(function () {
                                me.onceDestroyedDone(me);
                            }, 10);
                        }
                    }
                    if (this.isOnce) {
                        this.status = STATUS.NOT_UPDATE;
                        if (util.getType(this.onceDone) === 'function') {
                            var me = this;
                            setTimeout(function () {
                                me.onceDone(me);
                            }, 10);
                        }
                    }
                }
                if (this.frameIndex === this.realCols) {
                    this.total -= this.realCols;
                    this.frameIndex = 0;
                    this.sy += this.tileH;
                    this.sx = 0;
                    this.realCols = this.cols;
                }
            }
            return this;
        },
        render: function (ctx) {
            _setup.call(this);
            ctx.save();
            ctx.fillStyle = this.fillStyle;
            ctx.strokeStyle = this.strokeStyle;
            ctx.globalAlpha = this.alpha;
            SpriteSheet.superClass.render.apply(this, arguments);
            this.matrix.setCtxTransform(ctx);
            ctx.drawImage(this.asset, this.frameIndex * this.tileW + this.sx, this.sy, this.tileW, this.tileH, this.x + this.offsetX * this.game.ratioX, this.y + this.offsetY * this.game.ratioY, this.width, this.height);
            ctx.restore();
            return this;
        }
    };
    function _setup() {
        if (!this._.isSetup) {
            this._.isSetup = true;
            var curSheetData = null;
            var sheetKey = this.sheetKey;
            if (this.sheetData) {
                if (this.sheetData[sheetKey]) {
                    curSheetData = this.sheetData[sheetKey];
                } else {
                    curSheetData = this.sheetData;
                }
            }
            if (!curSheetData) {
                return;
            }
            util.extend(this, {
                total: 1,
                sx: 0,
                sy: 0,
                cols: 0,
                rows: 0,
                tileW: 0,
                tileH: 0,
                offsetX: 0,
                offsetY: 0
            }, curSheetData);
            this.originalSX = this.sx;
            this.originalTotal = this.total;
            this.realCols = floor(this.cols - this.sx / this.tileW);
            this.width = this.width || this.tileW;
            this.height = this.height || this.tileH;
        }
        return this;
    }
    util.inherits(SpriteSheet, Rectangle);
    return SpriteSheet;
});define('ig/ResourceLoader', [
    'require',
    './util',
    './dep/howler'
], function (require) {
    var util = require('./util');
    var Howl = require('./dep/howler').Howl;
    var defaultResourceTypes = {
        png: 'Image',
        jpg: 'Image',
        gif: 'Image',
        jpeg: 'Image',
        ogg: 'Audio',
        wav: 'Audio',
        m4a: 'Audio',
        mp3: 'Audio'
    };
    function ResourceLoader() {
        this.asset = {};
        return this;
    }
    ResourceLoader.prototype = {
        constructor: ResourceLoader,
        loadImage: function (id, src, callback, errorCallback) {
            var img = new Image();
            img.addEventListener('load', function (e) {
                callback(id, img);
            });
            img.addEventListener('error', function (e) {
                errorCallback(src);
            });
            img.src = src;
        },
        loadOther: function (id, src, callback, errorCallback) {
            var fileExt = getFileExt(src);
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    if (req.status === 200) {
                        if (fileExt === 'json') {
                            callback(id, JSON.parse(req.responseText));
                        } else {
                            callback(id, req.responseText);
                        }
                    } else {
                        errorCallback(src);
                    }
                }
            };
            req.open('GET', src, true);
            req.send(null);
        },
        loadResource: function (resource, callback, opts) {
            var me = this;
            opts = opts || {};
            if (!Array.isArray(resource)) {
                resource = [resource];
            }
            var loadError = false;
            var errorCallback = function (item) {
                loadError = true;
                (opts.errorCallback || function (errItem) {
                    alert('Loading Error: ' + errItem);
                    throw new Error('Loading Error: ' + errItem);
                }).call(me, item);
            };
            var processCallback = opts.processCallback || util.noop;
            var totalCount = resource.length;
            var remainingCount = totalCount;
            var loadOneCallback = function (id, obj) {
                if (loadError) {
                    return;
                }
                if (!me.asset[id]) {
                    me.asset[id] = obj;
                }
                remainingCount--;
                processCallback(totalCount - remainingCount, totalCount);
                if (remainingCount === 0 && callback) {
                    callback.call(me, me.asset);
                }
            };
            var customResourceTypes = opts.customResourceTypes || {};
            var resourceTypes = util.extend({}, defaultResourceTypes, customResourceTypes);
            for (var i = 0; i < totalCount; i++) {
                (function (index) {
                    var curResource = resource[index];
                    var resourceId;
                    var resourceSrc;
                    if (util.getType(curResource) === 'object') {
                        resourceId = curResource.id;
                        resourceSrc = curResource.src;
                    } else {
                        resourceId = resourceSrc = curResource;
                    }
                    if (!me.asset.hasOwnProperty(resourceId)) {
                        setTimeout(function () {
                            if (util.getType(resourceSrc) === 'array') {
                                (function (rId, r) {
                                    var howlOpts = {
                                        urls: resourceSrc,
                                        onload: function () {
                                            loadOneCallback(rId, this);
                                        },
                                        onloaderror: function () {
                                            errorCallback(this._src || this._urls);
                                        }
                                    };
                                    new Howl(util.extend(true, {}, howlOpts, r.opts || {}));
                                }(resourceId, curResource));
                            } else {
                                var invokeMethod = me['load' + resourceTypes[getFileExt(resourceSrc)]];
                                if (!invokeMethod) {
                                    invokeMethod = me.loadOther;
                                }
                                invokeMethod(resourceId, resourceSrc, loadOneCallback, errorCallback);
                            }
                        }, (index + 1) * 300);
                    } else {
                        loadOneCallback(resourceId, me.asset[resourceId]);
                    }
                }(i));
            }
        }
    };
    function getFileExt(fileName) {
        var segments = fileName.split('.');
        return segments[segments.length - 1].toLowerCase();
    }
    return ResourceLoader;
});'use strict';
define('ig/Game', [
    'require',
    './ig',
    './Event',
    './util',
    './env',
    './Stage',
    './ResourceLoader'
], function (require) {
    var ig = require('./ig');
    var Event = require('./Event');
    var util = require('./util');
    var env = require('./env');
    var Stage = require('./Stage');
    var ResourceLoader = require('./ResourceLoader');
    var CONFIG = ig.getConfig();
    var GUID_KEY = 0;
    function Game(opts) {
        util.extend(true, this, {
            name: 'ig_game_' + GUID_KEY++,
            canvas: null,
            maximize: false,
            scaleFit: true,
            resource: [],
            fps: CONFIG.fps,
            width: CONFIG.width,
            height: CONFIG.height,
            maxWidth: CONFIG.maxWidth,
            maxHeight: CONFIG.maxHeight,
            horizontalPageScroll: null
        }, opts);
        if (!this.canvas) {
            throw new Error('Game initialize must be require a canvas param');
        }
        this.paused = false;
        this.stageStack = [];
        this.stages = {};
        this._ = {};
        this.resourceLoader = new ResourceLoader();
        initGame.call(this);
        return this;
    }
    Game.prototype = {
        constructor: Game,
        stop: function () {
            window.cancelAnimationFrame(this._.requestID);
            this._.requestID = null;
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
        start: function (startStageName, startCallback) {
            var _startStageName = '';
            var _startCallback = util.noop;
            this.canStart = false;
            var argLength = arguments.length;
            switch (argLength) {
            case 1:
                if (util.getType(arguments[0]) === 'function') {
                    _startCallback = arguments[0];
                } else {
                    _startStageName = arguments[0];
                    _startCallback = util.noop;
                }
                break;
            case 2:
                _startStageName = arguments[0];
                _startCallback = arguments[1];
                break;
            default:
            }
            preLoadResource.call(this, function () {
                if (this._.requestID) {
                    this.stop();
                }
                this.paused = false;
                if (_startStageName && this.stages[_startStageName]) {
                    var stageStack = this.stageStack;
                    var candidateIndex = -1;
                    for (var i = 0, len = stageStack.length; i < len; i++) {
                        if (stageStack[i].name === _startStageName) {
                            candidateIndex = i;
                            break;
                        }
                    }
                    this.swapStage(candidateIndex, 0);
                } else {
                    _startStageName = this.getCurrentStage().name;
                }
                var curStage = this.getStageByName(_startStageName);
                curStage && _gameStartExec.call(this, curStage);
                util.getType(_startCallback) === 'function' && _startCallback.call(this);
            });
            return this;
        },
        loadOther: function (id, src, callback, errorCallback) {
            var _id;
            var _src;
            var _callback;
            var _errorCallback;
            var argLength = arguments.length;
            switch (argLength) {
            case 1:
                _id = _src = arguments[0];
                _callback = _errorCallback = util.noop;
                break;
            case 2:
                _id = _src = arguments[0];
                _callback = _errorCallback = arguments[1];
                break;
            case 3:
                _id = _src = arguments[0];
                _callback = arguments[1];
                _errorCallback = arguments[2];
                break;
            default:
                _id = arguments[0];
                _src = arguments[1];
                _callback = arguments[2];
                _errorCallback = arguments[3];
            }
            this.resourceLoader.loadOther(_id, _src, _callback, _errorCallback);
        },
        loadImage: function (id, src, callback, errorCallback) {
            var _id;
            var _src;
            var _callback;
            var _errorCallback;
            var argLength = arguments.length;
            switch (argLength) {
            case 1:
                _id = _src = arguments[0];
                _callback = _errorCallback = util.noop;
                break;
            case 2:
                _id = _src = arguments[0];
                _callback = _errorCallback = arguments[1];
                break;
            case 3:
                _id = _src = arguments[0];
                _callback = arguments[1];
                _errorCallback = arguments[2];
                break;
            default:
                _id = arguments[0];
                _src = arguments[1];
                _callback = arguments[2];
                _errorCallback = arguments[3];
            }
            this.resourceLoader.loadImage(_id, _src, _callback, _errorCallback);
        },
        loadResource: function (resource, callback, opts) {
            this.resourceLoader.loadResource(resource, callback, opts);
        },
        createStage: function (stageOpts) {
            stageOpts = util.extend(true, {}, {
                canvas: this.canvas,
                offCanvas: this.offCanvas,
                game: this
            }, stageOpts);
            var stage = new Stage(stageOpts);
            this.pushStage(stage);
            return stage;
        },
        pushStage: function (stage) {
            if (!this.getStageByName(stage.name)) {
                stage.game = this;
                this.stageStack.push(stage);
                this.stages[stage.name] = stage;
                this.sortStageIndex();
            }
        },
        popStage: function () {
            var stage = this.stageStack.pop();
            if (stage) {
                delete this.stages[stage.name];
                this.sortStageIndex();
            }
        },
        sortStageIndex: function () {
            var stageStack = this.stageStack;
            for (var i = stageStack.length - 1, j = 0; i >= 0; i--, j++) {
                stageStack[i].zIndex = j;
            }
        },
        removeStageByName: function (name) {
            var st = this.getStageByName(name);
            if (st) {
                delete this.stages[st.name];
                var stageStack = this.stageStack;
                util.removeArrByCondition(stageStack, function (s) {
                    return s.name === name;
                });
                this.sortStageIndex();
            }
        },
        getCurrentStage: function () {
            return this.stageStack[0];
        },
        getStageStack: function () {
            return this.stageStack;
        },
        getStageByName: function (name) {
            return this.stages[name];
        },
        changeStage: function (stageName) {
            if (stageName) {
                var stageStack = this.stageStack;
                var candidateIndex = -1;
                for (var i = 0, len = stageStack.length; i < len; i++) {
                    if (stageStack[i].name === stageName) {
                        candidateIndex = i;
                        break;
                    }
                }
                this.swapStage(candidateIndex, 0);
            }
        },
        swapStageByName: function (fromName, toName) {
            var stageStack = this.stageStack;
            var length = stageStack.length;
            var fromIndex = -1;
            var toIndex = -1;
            for (var i = 0; i < length; i++) {
                if (stageStack[i].name === fromName) {
                    fromIndex = i;
                }
                if (stageStack[i].name === toName) {
                    toIndex = i;
                }
            }
            if (fromIndex !== -1 && toIndex !== -1) {
                return this.swapStage(fromIndex, toIndex);
            }
            return this;
        },
        swapStage: function (from, to) {
            var stageStack = this.stageStack;
            var len = stageStack.length;
            if (from >= 0 && from <= len - 1 && to >= 0 && to <= len - 1) {
                var sc = stageStack[from];
                stageStack[from] = stageStack[to];
                stageStack[to] = sc;
                this.sortStageIndex();
            }
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return this;
        },
        getStageIndex: function (stage) {
            return stage.zIndex;
        },
        clearAllStage: function () {
            var stageStack = this.stageStack;
            for (var i = 0, len = stageStack.length; i < len; i++) {
                stageStack[i].destroy();
            }
            this.stages = {};
            this.stageStack = [];
        }
    };
    function _stageBg(stage) {
        stage.setBgColor(stage.bgColor);
        if (stage.bgImg) {
            stage.setBgImg(stage.bgImg, stage.bgImgRepeatPattern);
        }
    }
    function _stageParallax(stage) {
        var parallaxOpts = stage.parallaxOpts;
        stage.setParallax(parallaxOpts);
    }
    function _displayObjectAsset(stage) {
        var asset = this.asset;
        var resource = this.resource;
        var displayObjectList = stage.displayObjectList;
        for (var i = 0, len = displayObjectList.length; i < len; i++) {
            var displayObject = displayObjectList[i];
            if (!displayObject.asset && (displayObject instanceof ig.Bitmap || displayObject instanceof ig.BitmapPolygon || displayObject instanceof ig.SpriteSheet)) {
                var imageAsset = util.getImgAsset(displayObject.image, asset, resource);
                if (!imageAsset) {
                    throw new Error('' + displayObject.name + '\'s' + ' image: `' + displayObject.image + '` is not in game.asset');
                }
                displayObject.asset = imageAsset;
            }
            if (!displayObject.sheetData && displayObject instanceof ig.SpriteSheet) {
                var sheetAsset = util.getImgAsset(displayObject.sheet, asset, resource);
                if (!sheetAsset) {
                    throw new Error('' + displayObject.name + '\'s' + ' sheet: `' + displayObject.sheet + '` is not in game.asset');
                }
                displayObject.sheetData = sheetAsset;
            }
        }
    }
    function _stageStartExec(stage) {
        _stageBg.call(this, stage);
        _stageParallax.call(this, stage);
        _displayObjectAsset.call(this, stage);
    }
    function _gameStartExec(stage) {
        _stageStartExec.call(this, stage);
        var realFPS = 0;
        var realDt = 0;
        var realFPSStart = Date.now();
        var me = this;
        ig.loop({
            step: function (dt, stepCount, requestID) {
                if (me._.requestID === null && stepCount !== 1) {
                    return;
                }
                me._.requestID = requestID;
                if (!me.paused) {
                    if (realDt > 1000) {
                        realDt = 0;
                        realFPSStart = Date.now();
                        me.fire('gameFPS', { data: { fps: realFPS } });
                        realFPS = 0;
                    } else {
                        realDt = Date.now() - realFPSStart;
                        ++realFPS;
                    }
                    me.fire('beforeGameStep');
                    stage.step(dt, stepCount, requestID);
                    me.fire('afterGameStep');
                }
            },
            exec: function (execCount) {
                if (!me.paused) {
                    me.fire('beforeGameRender');
                    stage.render(execCount);
                    me.fire('afterGameRender');
                }
            }
        });
    }
    function preLoadResource(callback) {
        var me = this;
        if (Array.isArray(me.resource) && me.resource.length) {
            me.loadResource(me.resource, function (data) {
                me.asset = data;
                callback.call(me);
                me.fire('loadResDone');
            }, {
                processCallback: function (loadedCount, total) {
                    me.fire('loadResProcess', {
                        data: {
                            loadedCount: loadedCount,
                            total: total
                        }
                    });
                }
            });
        } else {
            me.asset = {};
            callback.call(me);
            me.fire('loadResDone');
        }
    }
    function initGame() {
        this.canvas = util.domWrap(this.canvas, document.createElement('div'), 'ig-game-container-' + this.name);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        var width = parseInt(this.canvas.width, 10);
        var height = parseInt(this.canvas.height, 10);
        var maxWidth = this.maxWidth;
        var maxHeight = this.maxHeight;
        if (this.maximize) {
            document.body.style.padding = 0;
            document.body.style.margin = 0;
        }
        if (env.supportTouch) {
            this.canvas.style.height = height * 2 + 'px';
            window.scrollTo(0, 1);
            width = Math.min(window.innerWidth, maxWidth);
            height = Math.min(window.innerHeight, maxHeight);
        }
        var horizontalPageScroll;
        var horizontalPageScrollType = util.getType(this.horizontalPageScroll);
        if (horizontalPageScrollType === 'number') {
            horizontalPageScroll = this.horizontalPageScroll;
        } else if (horizontalPageScrollType === 'boolean') {
            horizontalPageScroll = 17;
        } else {
            horizontalPageScroll = 0;
        }
        width = Math.min(window.innerWidth, maxWidth) - horizontalPageScroll;
        height = Math.min(window.innerHeight, maxHeight);
        this.ctx = this.canvas.getContext('2d');
        this.cssWidth = this.canvas.style.height = height + 'px';
        this.cssHeight = this.canvas.style.width = width + 'px';
        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;
        this.canvas.style.position = 'relative';
        var canvasParent = this.canvas.parentNode;
        canvasParent.style.width = width + 'px';
        canvasParent.style.margin = '0 auto';
        canvasParent.style.position = 'relative';
        var getRatio = function () {
            if (this.scaleFit) {
                fitScreen.call(this);
            }
            this.ratioX = this.width / CONFIG.width;
            this.ratioY = this.height / CONFIG.height;
            this.cssRatioX = this.width / parseInt(this.cssWidth, 10);
            this.cssRatioY = this.height / parseInt(this.cssHeight, 10);
        };
        getRatio.call(this);
        var me = this;
        window.addEventListener(env.supportOrientation ? 'orientationchange' : 'resize', function () {
            setTimeout(function () {
                window.scrollTo(0, 1);
                getRatio.call(me);
            }, 0);
        }, false);
        return this;
    }
    function fitScreen() {
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        var winRatio = winWidth / winHeight;
        var gameRatio = this.canvas.width / this.canvas.height;
        var scaleRatio = gameRatio < winRatio ? winHeight / this.canvas.height : winWidth / this.canvas.width;
        var scaleWidth = this.canvas.width * scaleRatio;
        var scaleHeight = this.canvas.height * scaleRatio;
        this.canvas.style.width = scaleWidth + 'px';
        this.canvas.style.height = scaleHeight + 'px';
        if (this.canvas.parentNode) {
            this.canvas.parentNode.style.width = scaleWidth + 'px';
            this.canvas.parentNode.style.height = scaleHeight + 'px';
        }
        if (gameRatio >= winRatio) {
            var topPos = (winHeight - scaleHeight) / 2;
            this.canvas.style.top = topPos + 'px';
        }
        this.width = this.canvas.width;
        this.cssWidth = this.canvas.style.width;
        this.height = this.canvas.height;
        this.cssHeight = this.canvas.style.height;
        this.scaleRatio = scaleRatio;
    }
    util.inherits(Game, Event);
    return Game;
});'use strict';
define('ig/Stage', [
    'require',
    './ig',
    './Event',
    './util',
    './domEvt'
], function (require) {
    var ig = require('./ig');
    var Event = require('./Event');
    var util = require('./util');
    var domEvt = require('./domEvt');
    var CONFIG = ig.getConfig();
    var STATUS = CONFIG.status;
    var newImage4ParallaxRepeat = new Image();
    var GUID_KEY = 0;
    function Stage(opts) {
        util.extend(true, this, {
            name: 'ig_stage_' + GUID_KEY++,
            canvas: opts.canvas,
            ctx: opts.canvas.getContext('2d'),
            width: opts.game.width,
            height: opts.game.height,
            cssWidth: opts.game.cssWidth,
            cssHeight: opts.game.cssHeight,
            bgColor: 'transparent',
            bgImg: '',
            bgImgRepeatPattern: '',
            parallaxOpts: [],
            captureFunc: util.noop,
            moveFunc: util.noop,
            releaseFunc: util.noop
        }, opts);
        this.displayObjectList = [];
        this.displayObjects = {};
        this.parallaxList = [];
        initMouseEvent.call(this);
        return this;
    }
    Stage.prototype = {
        constructor: Stage,
        setCaptureFunc: function (func) {
            this.captureFunc = func || util.noop;
            return this;
        },
        setMoveFunc: function (func) {
            this.moveFunc = func || util.noop;
            return this;
        },
        setReleaseFunc: function (func) {
            this.releaseFunc = func || util.noop;
            return this;
        },
        clear: function () {
            this.ctx.clearRect(0, 0, this.width, this.height);
            return this;
        },
        getIndex: function () {
            return this.zIndex;
        },
        setBgColor: function (color) {
            this.bgColor = color;
            this.canvas.style.backgroundColor = this.bgColor || 'transparent';
            return this;
        },
        setBgImg: function (img, bgImgRepeatPattern) {
            var bgRepeat = '';
            var bgPos = '';
            var bgSize = '';
            switch (bgImgRepeatPattern) {
            case 'center':
                bgRepeat = 'no-repeat';
                bgPos = 'center';
                break;
            case 'full':
                bgSize = '100% 100%';
                break;
            }
            this.canvas.style.backgroundRepeat = bgRepeat;
            this.canvas.style.backgroundPosition = bgPos;
            this.canvas.style.backgroundSize = bgSize;
            if (util.getType(img) === 'htmlimageelement') {
                this.canvas.style.backgroundImage = 'url(' + img.src + ')';
            } else if (util.getType(img) === 'string') {
                var asset = this.game.asset;
                var resource = this.game.resource;
                var bgImg = util.getImgAsset(img, asset, resource);
                if (bgImg) {
                    this.canvas.style.backgroundImage = 'url(' + bgImg.src + ')';
                } else {
                    this.canvas.style.backgroundImage = '';
                    this.canvas.style.backgroundRepeat = '';
                    this.canvas.style.backgroundPosition = '';
                    this.canvas.style.backgroundSize = '';
                }
            }
            return this;
        },
        setParallax: function (parallaxOpts) {
            parallaxOpts = parallaxOpts || [];
            if (!Array.isArray(parallaxOpts)) {
                parallaxOpts = [parallaxOpts];
            }
            var asset = this.game.asset;
            var resource = this.game.resource;
            for (var i = 0, len = parallaxOpts.length; i < len; i++) {
                var parallaxOpt = parallaxOpts[i];
                var imageAsset = util.getImgAsset(parallaxOpt.image, asset, resource);
                if (!imageAsset) {
                    throw new Error('Parallax must be require a image param');
                }
                parallaxOpt.repeat = parallaxOpt.repeat && [
                    'repeat',
                    'repeat-x',
                    'repeat-y'
                ].indexOf(parallaxOpt.repeat) !== -1 ? parallaxOpt.repeat : 'no-repeat';
                this.parallaxList.push(util.extend(true, { imageAsset: imageAsset }, {
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    ax: 0,
                    ay: 0
                }, parallaxOpt));
            }
            return this;
        },
        step: function (dt, stepCount, requestID) {
            this.fire('beforeStageStep');
            updateParallax.call(this, dt, stepCount, requestID);
            updateSprite.call(this, dt, stepCount, requestID);
            this.fire('afterStageStep');
        },
        render: function (execCount) {
            this.fire('beforeStageRender');
            this.clear();
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            renderParallax.call(this);
            renderSprite.call(this, execCount);
            this.ctx.restore();
            this.fire('afterStageRender');
        },
        addDisplayObject: function (displayObj) {
            if (displayObj && !this.getDisplayObjectByName(displayObj.name)) {
                displayObj.stage = this;
                displayObj.game = this.game;
                this.displayObjectList.push(displayObj);
                this.displayObjects[displayObj.name] = displayObj;
            }
            return displayObj;
        },
        getDisplayObjectByName: function (name) {
            return this.displayObjects[name];
        },
        getDisplayObjectList: function () {
            return this.displayObjectList;
        },
        sortDisplayObject: function () {
            this.displayObjectList.sort(function (o1, o2) {
                return o1.zIndex - o2.zIndex;
            });
        },
        removeDisplayObject: function (displayObj) {
            displayObj && this.removeDisplayObjectByName(displayObj.name);
            return this;
        },
        removeDisplayObjectByName: function (name) {
            var candidateObj = this.displayObjects[name];
            if (candidateObj) {
                delete this.displayObjects[candidateObj.name];
                var displayObjectList = this.displayObjectList;
                util.removeArrByCondition(displayObjectList, function (o) {
                    return o.name === name;
                });
            }
            return this;
        },
        clearAllDisplayObject: function () {
            this.displayObjectList = [];
            this.displayObjects = {};
        },
        destroy: function () {
            this.clearAllDisplayObject();
            this.clearEvents();
        }
    };
    function updateSprite(dt, stepCount, requestID) {
        var displayObjectList = this.displayObjectList;
        var len = displayObjectList.length;
        var displayObjectStatus;
        for (var i = 0; i < len; i++) {
            var curDisplay = displayObjectList[i];
            if (curDisplay) {
                displayObjectStatus = curDisplay.status;
                if (displayObjectStatus === STATUS.DESTROYED) {
                    this.removeDisplayObject(curDisplay);
                }
                if (displayObjectStatus === STATUS.NORMAL || displayObjectStatus === STATUS.NOT_RENDER) {
                    curDisplay._step(dt, stepCount, requestID);
                    curDisplay.step(dt, stepCount, requestID);
                }
            }
        }
    }
    function renderSprite(execCount) {
        this.sortDisplayObject();
        var displayObjectList = this.displayObjectList;
        var len = displayObjectList.length;
        var displayObjectStatus;
        for (var i = 0; i < len; i++) {
            var curDisplay = displayObjectList[i];
            if (curDisplay) {
                displayObjectStatus = curDisplay.status;
                if (displayObjectStatus === STATUS.NORMAL || displayObjectStatus === STATUS.NOT_UPDATE) {
                    curDisplay.render(this.ctx, execCount);
                }
            }
        }
    }
    function updateParallax(dt, stepCount, requestID) {
        var parallaxList = this.parallaxList;
        var len = parallaxList.length;
        if (!parallaxList || !len) {
            return;
        }
        for (var i = 0; i < len; i++) {
            var parallax = parallaxList[i];
            if (parallax.anims && util.getType(parallax.anims) === 'array') {
                parallax.animInterval = parallax.animInterval || 10000;
                if (!parallax.curAnim) {
                    parallax.curAnim = parallax.anims[0];
                }
                if (stepCount % parallax.animInterval === 0) {
                    if (parallax.time === void 0) {
                        parallax.time = 0;
                    }
                    parallax.time++;
                    if (parallax.time === parallax.anims.length) {
                        parallax.time = 0;
                    }
                    parallax.curAnim = parallax.anims[parallax.time];
                }
            } else {
                parallax.curAnim = {
                    ax: parallax.ax * dt,
                    ay: parallax.ay * dt
                };
            }
            parallax.vx = (parallax.vx * dt + parallax.curAnim.ax) % parallax.imageAsset.width;
            parallax.vy = (parallax.vy * dt + parallax.curAnim.ay) % parallax.imageAsset.height;
        }
    }
    function renderParallax() {
        var parallaxList = this.parallaxList;
        var len = parallaxList.length;
        if (!parallaxList || !len) {
            return;
        }
        var ctx = this.ctx;
        for (var i = 0; i < len; i++) {
            var parallax = parallaxList[i];
            if (parallax.repeat !== 'no-repeat') {
                renderParallaxRepeatImage.call(parallax, ctx);
            }
            var imageWidth = parallax.imageAsset.width;
            var imageHeight = parallax.imageAsset.height;
            var drawArea = {
                width: 0,
                height: 0
            };
            for (var y = 0; y < imageHeight; y += drawArea.height) {
                for (var x = 0; x < imageWidth; x += drawArea.width) {
                    var newPos = {
                        x: parallax.x + x,
                        y: parallax.y + y
                    };
                    var newArea = {
                        width: imageWidth - x,
                        height: imageHeight - y
                    };
                    var newScrollPos = {
                        x: 0,
                        y: 0
                    };
                    if (x === 0) {
                        newScrollPos.x = parallax.vx;
                    }
                    if (y === 0) {
                        newScrollPos.y = parallax.vy;
                    }
                    drawArea = renderParallaxScroll.call(parallax, ctx, newPos, newArea, newScrollPos, imageWidth, imageHeight);
                }
            }
        }
    }
    function renderParallaxScroll(ctx, newPos, newArea, newScrollPos, imageWidth, imageHeight) {
        var xOffset = Math.abs(newScrollPos.x) % imageWidth;
        var yOffset = Math.abs(newScrollPos.y) % imageHeight;
        var left = newScrollPos.x < 0 ? imageWidth - xOffset : xOffset;
        var top = newScrollPos.y < 0 ? imageHeight - yOffset : yOffset;
        var width = newArea.width < imageWidth - left ? newArea.width : imageWidth - left;
        var height = newArea.height < imageHeight - top ? newArea.height : imageHeight - top;
        ctx.drawImage(this.imageAsset, left, top, width, height, newPos.x, newPos.y, width, height);
        return {
            width: width,
            height: height
        };
    }
    function renderParallaxRepeatImage(ctx) {
        ctx.save();
        ctx.fillStyle = ctx.createPattern(this.imageAsset, this.repeat);
        ctx.fillRect(this.x, this.y, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
        if (!newImage4ParallaxRepeat.src) {
            newImage4ParallaxRepeat.src = ctx.canvas.toDataURL();
            this.imageAsset = newImage4ParallaxRepeat;
        }
    }
    function initMouseEvent() {
        bindMouseEvent.call(this);
        domEvt.initMouse(this);
        return this;
    }
    function bindMouseEvent() {
        var me = this;
        domEvt.events.forEach(function (name, i) {
            var invokeMethod = domEvt.fireEvt[name];
            if (invokeMethod) {
                me.on(name, invokeMethod);
            }
        });
        return me;
    }
    util.inherits(Stage, Event);
    return Stage;
});'use strict';
define('ig/domEvt', [
    'require',
    './util',
    './env'
], function (require) {
    var util = require('./util');
    var env = require('./env');
    var TOUCH_EVENTS = [
        'touchstart',
        'touchmove',
        'touchend'
    ];
    var MOUSE_EVENTS = [
        'mousedown',
        'mousemove',
        'mouseup'
    ];
    var holdSpriteList = [];
    var holdSprites = {};
    var subX = 0;
    var subY = 0;
    var exports = {};
    exports.events = env.supportTouch ? TOUCH_EVENTS : MOUSE_EVENTS;
    exports.fireEvt = {};
    exports.fireEvt.touchstart = exports.fireEvt.mousedown = function (e) {
        var target = e.target;
        if (util.getType(target.captureFunc) === 'function') {
            target.captureFunc.call(target, e.data);
        }
        var displayObjectList = target.displayObjectList;
        var candidateDisplayObject;
        var maxZIndex = -1;
        for (var i = 0, len = displayObjectList.length; i < len; i++) {
            var curDisplayObject = displayObjectList[i];
            if (curDisplayObject.mouseEnable && curDisplayObject.hitTestPoint(e.data.x, e.data.y)) {
                if (curDisplayObject.zIndex >= maxZIndex) {
                    maxZIndex = curDisplayObject.zIndex;
                    candidateDisplayObject = curDisplayObject;
                }
            }
        }
        if (candidateDisplayObject) {
            e.data.curStage = target;
            candidateDisplayObject.isCapture = true;
            subX = e.data.x - candidateDisplayObject.x;
            subY = e.data.y - candidateDisplayObject.y;
            candidateDisplayObject.captureFunc.call(candidateDisplayObject, e.data);
        }
        return target;
    };
    exports.fireEvt.touchmove = exports.fireEvt.mousemove = function (e) {
        var target = e.target;
        var displayObjectList = target.displayObjectList;
        for (var i = 0, len = displayObjectList.length; i < len; i++) {
            var curDisplayObject = displayObjectList[i];
            if (curDisplayObject.hitTestPoint(e.data.x, e.data.y) && !holdSprites[curDisplayObject.name]) {
                holdSpriteList.push(curDisplayObject);
                holdSprites[curDisplayObject.name] = curDisplayObject;
            }
            e.data.holdSpriteList = holdSpriteList;
            e.data.holdSprites = holdSprites;
            if (curDisplayObject.mouseEnable && curDisplayObject.isCapture) {
                e.data.curStage = target;
                e.data.x = e.data.x - subX;
                e.data.y = e.data.y - subY;
                curDisplayObject.moveFunc.call(curDisplayObject, e.data);
            }
        }
        if (util.getType(target.moveFunc) === 'function') {
            target.moveFunc.call(target, e.data);
        }
        return target;
    };
    exports.fireEvt.touchend = exports.fireEvt.mouseup = function (e) {
        var target = e.target;
        if (util.getType(target.releaseFunc) === 'function') {
            target.releaseFunc.call(target, e.data);
        }
        var displayObjectList = target.displayObjectList;
        for (var i = 0, len = displayObjectList.length; i < len; i++) {
            var curDisplayObject = displayObjectList[i];
            if (curDisplayObject.isCapture || holdSprites[curDisplayObject.name]) {
                curDisplayObject.releaseFunc.call(curDisplayObject, e.data);
                curDisplayObject.isCapture = false;
            }
        }
        subX = 0;
        subY = 0;
        holdSpriteList = [];
        holdSprites = {};
        return target;
    };
    exports.initMouse = function (stage) {
        this.stage = stage;
        this.element = stage.canvas;
        this.x = 0;
        this.y = 0;
        this.isDown = false;
        var offset = util.getElementOffset(this.element);
        this.offsetX = offset.x;
        this.offsetY = offset.y;
        this.addEvent();
        return this;
    };
    exports.addEvent = function () {
        var me = this;
        var elem = me.element;
        var ratioWidth = me.stage.game.cssRatioX;
        var ratioHeight = me.stage.game.cssRatioY;
        me.events.forEach(function (name, i) {
            elem.addEventListener(name, function (e) {
                if (i === 0) {
                    me.isDown = true;
                } else if (i === 2) {
                    me.isDown = false;
                }
                var x = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
                var y = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
                me.x = (x - me.offsetX) * ratioWidth;
                me.y = (y - me.offsetY) * ratioHeight;
                me.stage.fire(name, {
                    data: {
                        x: me.x,
                        y: me.y,
                        isDown: me.isDown,
                        domEvent: e
                    }
                });
            });
        });
    };
    return exports;
});define('ig/Storage', [
    'require',
    './util',
    './env',
    './Event'
], function (require) {
    var util = require('./util');
    var env = require('./env');
    var Event = require('./Event');
    var STORAGE_ID = '_IG';
    var EVENT = { OUT_OF_LIMIT: 'Out of space limit' };
    var stringify = function (v) {
        return JSON.stringify(v);
    };
    var parse = function (v) {
        try {
            v = JSON.parse(v);
        } catch (e) {
        }
        return v;
    };
    var memoryStorage = {
        data: {},
        setItem: function (k, v) {
            this.data[k] = v;
        },
        getItem: function (k) {
            return this.data[k];
        },
        removeItem: function (k) {
            delete this.data[k];
        }
    };
    function Storage(opts) {
        util.extend(true, this, {
            storageId: STORAGE_ID,
            memoryCache: false
        }, opts);
        this.storage = env.supportLocalStorage && !this.memoryCache ? window.localStorage : memoryStorage;
        return this;
    }
    Storage.prototype = {
        constructor: Storage,
        setItem: function (key, val) {
            var data = this._getData();
            data[key] = val;
            try {
                this.storage.setItem(this.storageId, stringify(data));
                return true;
            } catch (err) {
                this.fire(EVENT.OUT_OF_LIMIT, { data: err });
                return false;
            }
        },
        getItem: function (key) {
            return this._getData()[key];
        },
        removeItem: function (key) {
            var data = this._getData();
            delete data[key];
            this.storage.setItem(this.storageId, stringify(data));
        },
        clear: function () {
            this.storage.removeItem(this.storageId);
        },
        key: function () {
            return Object.keys(this._getData());
        },
        _getData: function () {
            var data = this.storage.getItem(this.storageId);
            return data ? parse(data) : {};
        }
    };
    util.inherits(Storage, Event);
    return Storage;
});define('ig/Projection', ['require'], function (require) {
    function Projection(min, max) {
        this.min = min;
        this.max = max;
    }
    Projection.prototype = {
        constructor: Projection,
        overlaps: function (projection) {
            return this.max > projection.min && this.min < projection.max;
        },
        getOverlap: function (projection) {
            var overlap;
            if (!this.overlaps(projection)) {
                return 0;
            }
            if (this.max > projection.max) {
                overlap = projection.max - this.min;
            } else {
                overlap = this.max - projection.min;
            }
            return overlap;
        }
    };
    return Projection;
});'use strict';
define('ig/Rectangle', [
    'require',
    './util',
    './Vector',
    './Projection',
    './DisplayObject'
], function (require) {
    var util = require('./util');
    var Vector = require('./Vector');
    var Projection = require('./Projection');
    var DisplayObject = require('./DisplayObject');
    function Rectangle(opts) {
        DisplayObject.call(this, opts);
        return this;
    }
    Rectangle.prototype = {
        constructor: Rectangle,
        generatePoints: function () {
            this.points = [
                {
                    x: this.x,
                    y: this.y
                },
                {
                    x: this.x + this.width,
                    y: this.y
                },
                {
                    x: this.x + this.width,
                    y: this.y + this.height
                },
                {
                    x: this.x,
                    y: this.y + this.height
                }
            ];
            for (var i = 0, len = this.points.length; i < len; i++) {
                var transformPoint = this.matrix.transformPoint(this.points[i].x, this.points[i].y);
                this.points[i] = {
                    x: transformPoint.x,
                    y: transformPoint.y
                };
            }
            this.cx = this.x + this.width / 2;
            this.cy = this.y + this.height / 2;
            return this;
        },
        getBounds: function () {
            var points = this.points;
            var minX = Number.MAX_VALUE;
            var maxX = Number.MIN_VALUE;
            var minY = Number.MAX_VALUE;
            var maxY = Number.MIN_VALUE;
            for (var i = 0, len = points.length; i < len; i++) {
                if (points[i].x < minX) {
                    minX = points[i].x;
                }
                if (points[i].x > maxX) {
                    maxX = points[i].x;
                }
                if (points[i].y < minY) {
                    minY = points[i].y;
                }
                if (points[i].y > maxY) {
                    maxY = points[i].y;
                }
            }
            this.bounds = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
            return this;
        },
        createPath: function (ctx) {
            var points = this.points;
            if (!points) {
                return;
            }
            var len = points.length;
            if (!len) {
                return;
            }
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (var i = 0; i < len; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            return this;
        },
        isPointInPath: function (ctx, x, y) {
            this.createPath(ctx);
            return ctx.isPointInPath(x, y);
        },
        hitTestPoint: function (x, y) {
            var stage = this.stage;
            return this.isPointInPath(stage.ctx, x, y);
        },
        getAxes: function () {
            var v1 = new Vector();
            var v2 = new Vector();
            var axes = [];
            var points = this.points;
            for (var i = 0, len = points.length - 1; i < len; i++) {
                v1.x = points[i].x;
                v1.y = points[i].y;
                v2.x = points[i + 1].x;
                v2.y = points[i + 1].y;
                axes.push(v1.edge(v2).normal());
            }
            return axes;
        },
        project: function (axis) {
            var scalars = [];
            var v = new Vector();
            var points = this.points;
            for (var i = 0, len = points.length; i < len; i++) {
                var point = points[i];
                v.x = point.x;
                v.y = point.y;
                scalars.push(v.dot(axis));
            }
            return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
        },
        collidesWith: function (rectangle) {
            return !(this.x + this.width < rectangle.x || rectangle.x + rectangle.width < this.x || this.y + this.height < rectangle.y || rectangle.y + rectangle.height < this.y);
        },
        separationOnAxes: function (axes, rectangle) {
            for (var i = 0, len = axes.length; i < len; i++) {
                var axis = axes[i];
                var projection1 = rectangle.project(axis);
                var projection2 = this.project(axis);
                if (!projection1.overlaps(projection2)) {
                    return true;
                }
            }
            return false;
        },
        move: function (x, y) {
            this.x = x;
            this.y = y;
            this.generatePoints();
            this.getBounds();
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                if (child.followParent) {
                    child.move(x + child.relativeX, y + child.relativeY);
                }
            }
            return this;
        },
        render: function (ctx) {
            _childrenHandler.call(this);
            ctx.save();
            ctx.fillStyle = this.fillStyle;
            ctx.strokeStyle = this.strokeStyle;
            ctx.globalAlpha = this.alpha;
            if (!this.parent || !this.followParent) {
                this.matrix.reset();
                this.matrix.translate(this.cx, this.cy);
                this.matrix.rotate(this.angle);
                this.matrix.scale(this.scaleX, this.scaleY);
                this.matrix.translate(-this.cx, -this.cy);
            }
            this.generatePoints();
            this.getBounds();
            this.createPath(ctx);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            this.debugRender(ctx);
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].setMatrix(this.matrix.m);
            }
            return this;
        },
        debugRender: function (ctx) {
            if (this.debug) {
                ctx.save();
                ctx.strokeStyle = '#0f0';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
                ctx.strokeStyle = '#f00';
                ctx.beginPath();
                this.createPath(ctx);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }
        }
    };
    function _childrenHandler() {
        if (!this._.isHandleChildren) {
            this._.isHandleChildren = true;
            var children = this.children;
            if (!Array.isArray(children)) {
                children = [children];
            }
            var stage = this.stage;
            var len = children.length;
            for (var i = 0; i < len; i++) {
                var child = children[i];
                child.relativeX = child.x;
                child.relativeY = child.y;
                child.x += this.x;
                child.y += this.y;
                child.move(child.x, child.y);
                child.parent = this;
                child.setMatrix(this.matrix.m);
                stage.addDisplayObject(child);
            }
        }
    }
    util.inherits(Rectangle, DisplayObject);
    return Rectangle;
});'use strict';
define('ig/Polygon', [
    'require',
    './util',
    './Vector',
    './Projection',
    './DisplayObject'
], function (require) {
    var util = require('./util');
    var Vector = require('./Vector');
    var Projection = require('./Projection');
    var DisplayObject = require('./DisplayObject');
    function Polygon(opts) {
        DisplayObject.call(this, opts);
        util.extend(true, this, { points: [] }, opts);
        for (var i = 0, len = this.points.length; i < len; i++) {
            var point = this.points[i];
            this.points[i] = {
                x: point.x + this.x,
                y: point.y + this.y
            };
        }
        this.origin = {
            x: this.x,
            y: this.y,
            points: util.extend(true, [], this.points),
            persistencePoints: util.extend(true, [], this.points)
        };
        this.getBounds();
        this.cx = this.bounds.x + this.bounds.width / 2;
        this.cy = this.bounds.y + this.bounds.height / 2;
        return this;
    }
    Polygon.prototype = {
        constructor: Polygon,
        generatePoints: function () {
            for (var i = 0, len = this.origin.points.length; i < len; i++) {
                var transformPoint = this.matrix.transformPoint(this.origin.points[i].x, this.origin.points[i].y);
                this.points[i] = {
                    x: transformPoint.x,
                    y: transformPoint.y
                };
            }
            return this;
        },
        getBounds: function () {
            var points = this.points;
            var minX = Number.MAX_VALUE;
            var maxX = Number.MIN_VALUE;
            var minY = Number.MAX_VALUE;
            var maxY = Number.MIN_VALUE;
            for (var i = 0, len = points.length; i < len; i++) {
                if (points[i].x < minX) {
                    minX = points[i].x;
                }
                if (points[i].x > maxX) {
                    maxX = points[i].x;
                }
                if (points[i].y < minY) {
                    minY = points[i].y;
                }
                if (points[i].y > maxY) {
                    maxY = points[i].y;
                }
            }
            this.bounds = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
            return this;
        },
        getOriginBounds: function () {
            var points = this.origin.points;
            var minX = Number.MAX_VALUE;
            var maxX = Number.MIN_VALUE;
            var minY = Number.MAX_VALUE;
            var maxY = Number.MIN_VALUE;
            for (var i = 0, len = points.length; i < len; i++) {
                if (points[i].x < minX) {
                    minX = points[i].x;
                }
                if (points[i].x > maxX) {
                    maxX = points[i].x;
                }
                if (points[i].y < minY) {
                    minY = points[i].y;
                }
                if (points[i].y > maxY) {
                    maxY = points[i].y;
                }
            }
            this.originBounds = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
            return this;
        },
        createPath: function (ctx) {
            var points = this.points;
            if (!points) {
                return;
            }
            var len = points.length;
            if (!len) {
                return;
            }
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (var i = 0; i < len; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            return this;
        },
        isPointInPath: function (ctx, x, y) {
            this.createPath(ctx);
            return ctx.isPointInPath(x, y);
        },
        hitTestPoint: function (x, y) {
            var stage = this.stage;
            return this.isPointInPath(stage.ctx, x, y);
        },
        getAxes: function () {
            var v1 = new Vector();
            var v2 = new Vector();
            var axes = [];
            var points = this.points;
            for (var i = 0, len = points.length - 1; i < len; i++) {
                v1.x = points[i].x;
                v1.y = points[i].y;
                v2.x = points[i + 1].x;
                v2.y = points[i + 1].y;
                axes.push(v1.edge(v2).normal());
            }
            return axes;
        },
        project: function (axis) {
            var scalars = [];
            var v = new Vector();
            var points = this.points;
            for (var i = 0, len = points.length; i < len; i++) {
                var point = points[i];
                v.x = point.x;
                v.y = point.y;
                scalars.push(v.dot(axis));
            }
            return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
        },
        collidesWith: function (polygon) {
            var axes = this.getAxes().concat(polygon.getAxes());
            return !this.separationOnAxes(axes, polygon);
        },
        separationOnAxes: function (axes, polygon) {
            for (var i = 0, len = axes.length; i < len; i++) {
                var axis = axes[i];
                var projection1 = polygon.project(axis);
                var projection2 = this.project(axis);
                if (!projection1.overlaps(projection2)) {
                    return true;
                }
            }
            return false;
        },
        move: function (x, y) {
            this.x = x;
            this.y = y;
            for (var j = 0, len = this.origin.persistencePoints.length; j < len; j++) {
                this.origin.points[j] = {
                    x: this.origin.persistencePoints[j].x + x - this.origin.x,
                    y: this.origin.persistencePoints[j].y + y - this.origin.y
                };
            }
            var points = this.origin.points;
            var minX = Number.MAX_VALUE;
            var maxX = Number.MIN_VALUE;
            var minY = Number.MAX_VALUE;
            var maxY = Number.MIN_VALUE;
            for (var i = 0, pLen = points.length; i < pLen; i++) {
                if (points[i].x < minX) {
                    minX = points[i].x;
                }
                if (points[i].x > maxX) {
                    maxX = points[i].x;
                }
                if (points[i].y < minY) {
                    minY = points[i].y;
                }
                if (points[i].y > maxY) {
                    maxY = points[i].y;
                }
            }
            this.cx = minX + (maxX - minX) / 2;
            this.cy = minY + (maxY - minY) / 2;
            this.getOriginBounds();
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                if (child.followParent) {
                    child.move(x + child.relativeX, y + child.relativeY);
                }
            }
            return this;
        },
        render: function (ctx) {
            _childrenHandler.call(this);
            ctx.save();
            ctx.fillStyle = this.fillStyle;
            ctx.strokeStyle = this.strokeStyle;
            ctx.globalAlpha = this.alpha;
            if (!this.parent || !this.followParent) {
                this.matrix.reset();
                this.matrix.translate(this.cx, this.cy);
                this.matrix.rotate(this.angle);
                this.matrix.scale(this.scaleX, this.scaleY);
                this.matrix.translate(-this.cx, -this.cy);
            }
            this.generatePoints();
            this.getBounds();
            this.createPath(ctx);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].setMatrix(this.matrix.m);
            }
            this.debugRender(ctx);
            return this;
        },
        debugRender: function (ctx) {
            if (this.debug) {
                ctx.save();
                ctx.strokeStyle = '#0f0';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
                if (this.points.length) {
                    ctx.strokeStyle = '#f00';
                    ctx.beginPath();
                    this.createPath(ctx);
                    ctx.closePath();
                    ctx.stroke();
                }
                ctx.restore();
            }
        }
    };
    function _childrenHandler() {
        if (!this._.isHandleChildren) {
            this._.isHandleChildren = true;
            var children = this.children;
            if (!Array.isArray(children)) {
                children = [children];
            }
            var stage = this.stage;
            var len = children.length;
            for (var i = 0; i < len; i++) {
                var child = children[i];
                child.relativeX = child.x;
                child.relativeY = child.y;
                child.x += this.x;
                child.y += this.y;
                child.move(child.x, child.y);
                child.parent = this;
                child.setMatrix(this.matrix.m);
                stage.addDisplayObject(child);
            }
        }
    }
    util.inherits(Polygon, DisplayObject);
    return Polygon;
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

var modName = 'ig/config';
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

var modName = 'ig/Matrix';
var refName = 'Matrix';
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

var modName = 'ig/DisplayObject';
var refName = 'DisplayObject';
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

var modName = 'ig/Text';
var refName = 'Text';
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

var modName = 'ig/Bitmap';
var refName = 'Bitmap';
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

var modName = 'ig/BitmapPolygon';
var refName = 'BitmapPolygon';
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

var modName = 'ig/SpriteSheet';
var refName = 'SpriteSheet';
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

var modName = 'ig/ResourceLoader';
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

var modName = 'ig/Game';
var refName = 'Game';
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

var modName = 'ig/Stage';
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

var modName = 'ig/domEvt';
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

var modName = 'ig/Storage';
var refName = 'Storage';
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

var modName = 'ig/Projection';
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

var modName = 'ig/Rectangle';
var refName = 'Rectangle';
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

var modName = 'ig/Polygon';
var refName = 'Polygon';
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
