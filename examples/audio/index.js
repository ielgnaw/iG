
'use strict';

/* global ig */

window.onload = function () {

    /*var BUFFERS_TO_LOAD = {
        a1m: './data/a1.mp3',
        a1o: './data/a1.ogg',
        a2m: './data/a2.mp3',
        a2o: './data/a2.ogg',
        a3m: './data/a3.mp3',
        a3o: './data/a3.ogg',
        a4m: './data/a4.mp3',
        a4o: './data/a4.ogg',
        a5m: './data/a5.mp3',
        a5o: './data/a5.ogg',
        a6m: './data/a6.mp3',
        a6o: './data/a6.ogg'
    };

    var sound = new Howl({
        urls: ['./data/a1.mp3', './data/a1.ogg']
    });

    console.warn(sound);

    document.querySelector('#play').addEventListener('click', function (e) {
        alert(1);
        sound.stop().play();
    })*/

    var hasWebAudio = (typeof AudioContext !== 'undefined') || (typeof webkitAudioContext !== 'undefined');
    var audioContext;
    if (hasWebAudio) {
        if (typeof AudioContext !== 'undefined') {
            audioContext = new AudioContext();
        }
        else {
            audioContext = new window.webkitAudioContext();
        }
    }

    // android qq 浏览器 audioContext = undefined
    // alert(audioContext);

    function enableSound() {
        if (hasWebAudio) {
            enableWebAudioSound();
        }
        else {
            enableHTML5Sound();
        }
    }

    function enableWebAudioSound() {
        var webSound = {
            channels: [],
            channelMax: 10,
            active: {},
            play: function() {}
        };
        webSound.type = 'WebAudio';
        webSound.soundID = 0;
        webSound.playingSounds = {};

        webSound.removeSound = function (soundID) {
            delete webSound.playingSounds[soundID];
        };

        webSound.play = function (s, options) {
            var now = new Date().getTime();

            if(webSound.active[s] && webSound.active[s] > now) {
                return;
            }

            if (options && options['debounce']) {
                webSound.active[s] = now + options['debounce'];
            }
            else {
                delete webSound.active[s];
            }

            var soundID = webSound.soundID++;

            var source = audioContext.createBufferSource();
            alert(s)
            source.buffer = s; // 流
            source.connect(audioContext.destination);
            if (options && options['loop']) {
                source.loop = true;
            }
            else {
                setTimeout(function() {
                    webSound.removeSound(soundID);
                }, source.buffer.duration * 1000);
            }
            source.assetName = s;
            if (source.start) {
                source.start(0);
            }
            else {
                source.noteOn(0);
            }

            webSound.playingSounds[soundID] = source;
        };

        webSound.stop = function (s) {
            for (var key in webSound.playingSounds) {
                var snd = webSound.playingSounds[key];
                if(!s || s === snd.assetName) {
                    if (snd.stop) {
                        snd.stop(0);
                    }
                    else {
                        snd.noteOff(0);
                    }
                }
            }
        };
        return webSound;
    }

    function enableHTML5Sound() {
        var h5Sound = {
            channels: [],
            channelMax: 10,
            active: {},
            play: function() {}
        };
        h5Sound.type = "HTML5";

        for (var i = 0; i < h5Sound.channelMax; i++) {
            h5Sound.channels[i] = {};
            h5Sound.channels[i]['channel'] = new Audio();
            h5Sound.channels[i]['finished'] = -1;
        }

        h5Sound.play = function (s,options) {
            var now = new Date().getTime();
            if (h5Sound.active[s] && h5Sound.active[s] > now) {
                return;
            }

            if (options && options['debounce']) {
                h5Sound.active[s] = now + options['debounce'];
            }
            else {
                delete h5Sound.active[s];
            }

            for (var i = 0; i < h5Sound.channels.length; i++) {
                if (!h5Sound.channels[i]['loop'] && h5Sound.channels[i]['finished'] < now) {
                    h5Sound.channels[i]['channel'].src = s.src;
                    if(options && options['loop']) {
                        h5Sound.channels[i]['loop'] = true;
                        h5Sound.channels[i]['channel'].loop = true;
                    }
                    else {
                        s.duration = 40;
                        h5Sound.channels[i]['finished'] = now + s.duration*1000;
                    }
                    h5Sound.channels[i]['channel'].load();
                    h5Sound.channels[i]['channel'].play();
                    break;
                }
            }
        };

        h5Sound.stop = function (s) {
            var src = s ? s.src : null;
            var tm = new Date().getTime();
            for (var i = 0; i < h5Sound.channels.length; i++) {
                if ((!src || h5Sound.channels[i]['channel'].src === src) &&
                    (h5Sound.channels[i]['loop'] || h5Sound.channels[i]['finished'] >= tm)
                ) {
                    h5Sound.channels[i]['channel'].pause();
                    h5Sound.channels[i]['loop'] = false;
                }
            }
        };

        return h5Sound;
    }

    function finishedLoading(bufferList) {
        // var sound = enableWebAudioSound();
        // sound.play(bufferList[0]); // safari mobile 不行

        // var sound = enableHTML5Sound();
        // sound.play(bufferList[0]);

        // var snd = new Audio();
        // snd.src = './data/a5.ogg';
        // var sound = enableHTML5Sound();
        // sound.play(snd);

        document.querySelector('#play').addEventListener('click', function (e) {
            // alert(99);
            // android
            // var snd = new Audio();
            // // snd.src = './data/a5.mp3';
            // snd.src = './data/a5.ogg';
            // // snd.src = './data/blueyellow.wav';
            // var sound = enableHTML5Sound();
            // sound.play(snd);
            alert(11)
            // safari
            var sound = enableWebAudioSound();
            sound.play(bufferList[0]);
        })
    }

    function BufferLoader(context, urlList, callback) {
        this.context = context;
        this.urlList = urlList;
        this.onload = callback;
        this.bufferList = new Array();
        this.loadCount = 0;
    }

    BufferLoader.prototype.loadBuffer = function(url, index) {
        // Load buffer asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        var loader = this;

        request.onload = function() {
            loader.context.decodeAudioData(
                request.response,
                function(buffer) {
                    if (!buffer) {
                        alert('error decoding file data: ' + url);
                        return;
                    }
                    loader.bufferList[index] = buffer;
                    if (++loader.loadCount == loader.urlList.length) {
                        loader.onload(loader.bufferList);
                    }
                },
                function (error) {
                    console.error('decodeAudioData error', error);
                }
            );
        }

        request.onerror = function() {
            alert('BufferLoader: XHR error');
        }

        request.send();
    }

    BufferLoader.prototype.load = function() {
        for (var i = 0; i < this.urlList.length; i++) {
            this.loadBuffer(this.urlList[i], i);
        }
    }

    var bufferLoader = new BufferLoader(
        audioContext,
        [
          // './data/a5.mp3',
          './data/blueyellow.wav',
        ],
        finishedLoading
    );

    bufferLoader.load();

    /*var context;
    var bufferLoader;

    function init() {
      // Fix up prefixing
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();

      bufferLoader = new BufferLoader(
        context,
        [
          // './data/a5.mp3',
          './data/blueyellow.wav',
        ],
        finishedLoading
        );

      bufferLoader.load();
    }

    function finishedLoading(bufferList) {
        console.warn(1);
        console.warn(bufferList);
        // Create two sources and play them both together.
        var source1 = context.createBufferSource();
        // var source2 = context.createBufferSource();
        source1.buffer = bufferList[0];
        // source2.buffer = bufferList[1];

        source1.connect(context.destination);
        // source2.connect(context.destination);
        source1.start(0);
        // source2.start(0);
    }

    init();*/


    /*var BUFFERS = {};
    var context = null;

    var BUFFERS_TO_LOAD = {
        a1m: './data/a1.mp3',
        a1o: './data/a1.ogg',
        a2m: './data/a2.mp3',
        a2o: './data/a2.ogg',
        a3m: './data/a3.mp3',
        a3o: './data/a3.ogg',
        a4m: './data/a4.mp3',
        a4o: './data/a4.ogg',
        a5m: './data/a5.mp3',
        a5o: './data/a5.ogg',
        a6m: './data/a6.mp3',
        a6o: './data/a6.ogg'
    };

    function loadBuffers() {
        var names = [];
        var paths = [];
        for (var name in BUFFERS_TO_LOAD) {
            var path = BUFFERS_TO_LOAD[name];
            names.push(name);
            paths.push(path);
        }
        var bufferLoader = new BufferLoader(context, paths, function(bufferList) {
            for (var i = 0; i < bufferList.length; i++) {
                var buffer = bufferList[i];
                var name = names[i];
                BUFFERS[name] = buffer;
            }
        });
        bufferLoader.load();
    }

    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
    }
    catch(e) {
        alert('Web Audio API is not supported in this browser');
    }
    loadBuffers();

    function playSound(buffer) {
      var source = context.createBufferSource(); // creates a sound source
      source.buffer = buffer;                    // tell the source which sound to play
      source.connect(context.destination);       // connect the source to the context's destination (the speakers)
      source.start(0);                           // play the source now
                                                 // note: on older systems, may have to use deprecated noteOn(time);
    }

    setTimeout(function () {
        alert(1)
        playSound(BUFFERS.a1m);
    }, 3000)*/

    /*var VolumeSample = {};

    // Gain node needs to be mutated by volume control.
    VolumeSample.gainNode = null;

    VolumeSample.play = function () {
        if (!context.createGain) {
            context.createGain = context.createGainNode;
        }
        this.gainNode = context.createGain();
        var source = context.createBufferSource();
        source.buffer = BUFFERS.a1m;

        // Connect source to a gain node
        source.connect(this.gainNode);
        // Connect gain node to destination
        this.gainNode.connect(context.destination);
        // Start playback in a loop
        source.loop = true;
        if (!source.start) {
            source.start = source.noteOn;
        }
        source.start(0);
        this.source = source;
    };

    VolumeSample.changeVolume = function (element) {
        var volume = element.value;
        var fraction = parseInt(element.value) / parseInt(element.max);
        // Let's use an x*x curve (x-squared) since simple linear (x) does not
        // sound as good.
        this.gainNode.gain.value = fraction * fraction;
    };

    VolumeSample.stop = function () {
        if (!this.source.stop) {
            this.source.stop = source.noteOff;
        }
        this.source.stop(0);
    };

    VolumeSample.toggle = function () {
        this.playing ? this.stop() : this.play();
        this.playing = !this.playing;
    };

    var volumeNode = document.querySelector('#volume');
    var volumeRangeNode = document.querySelector('#volume-range');

    volumeNode.addEventListener('click', function (e) {
        alert(1)
        VolumeSample.toggle();
    });
    setTimeout(function () {
        alert(1)
        VolumeSample.toggle();
    }, 3000)

    volumeRangeNode.addEventListener('click', function (e) {
        console.warn(this);
        VolumeSample.changeVolume(this);
    });*/


    /*var FilterSample = {
        FREQ_MUL: 7000,
        QUAL_MUL: 30,
        playing: false
    };

    FilterSample.play = function () {
        // Create the source.
        var source = context.createBufferSource();
        source.buffer = BUFFERS.techno;
        // Create the filter.
        var filter = context.createBiquadFilter();
        //filter.type is defined as string type in the latest API. But this is defined as number type in old API.
        filter.type = (typeof filter.type === 'string') ? 'lowpass' : 0; // LOWPASS
        filter.frequency.value = 5000;
        // Connect source to filter, filter to destination.
        source.connect(filter);
        filter.connect(context.destination);
        // Play!
        if (!source.start)
            source.start = source.noteOn;
        source.start(0);
        source.loop = true;
        // Save source and filterNode for later access.
        this.source = source;
        this.filter = filter;
    };

    FilterSample.stop = function () {
        if (!this.source.stop)
            this.source.stop = source.noteOff;
        this.source.stop(0);
        this.source.noteOff(0);
    };

    FilterSample.toggle = function () {
        this.playing ? this.stop() : this.play();
        this.playing = !this.playing;
    };

    FilterSample.changeFrequency = function (element) {
        // Clamp the frequency between the minimum value (40 Hz) and half of the
        // sampling rate.
        var minValue = 40;
        var maxValue = context.sampleRate / 2;
        // Logarithm (base 2) to compute how many octaves fall in the range.
        var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
        // Compute a multiplier from 0 to 1 based on an exponential scale.
        var multiplier = Math.pow(2, numberOfOctaves * (element.value - 1.0));
        // Get back to the frequency value between min and max.
        this.filter.frequency.value = maxValue * multiplier;
    };

    FilterSample.changeQuality = function (element) {
        this.filter.Q.value = element.value * this.QUAL_MUL;
    };

    FilterSample.toggleFilter = function (element) {
        this.source.disconnect(0);
        this.filter.disconnect(0);
        // Check if we want to enable the filter.
        if (element.checked) {
            // Connect through the filter.
            this.source.connect(this.filter);
            this.filter.connect(context.destination);
        } else {
            // Otherwise, connect directly.
            this.source.connect(context.destination);
        }
    };

    console.warn(FilterSample);*/


};
