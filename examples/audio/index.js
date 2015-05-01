
'use strict';

/* global ig */

window.onload = function () {

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

    var context;
    var bufferLoader;

    function init() {
      // Fix up prefixing
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();

      bufferLoader = new BufferLoader(
        context,
        [
          './data/a5.mp3',
          './data/blueyellow.wav',
        ],
        finishedLoading
        );

      bufferLoader.load();
    }

    function finishedLoading(bufferList) {
        console.warn(bufferList);
        // Create two sources and play them both together.
        var source1 = context.createBufferSource();
        var source2 = context.createBufferSource();
        source1.buffer = bufferList[0];
        source2.buffer = bufferList[1];

        source1.connect(context.destination);
        source2.connect(context.destination);
        source1.start(0);
        source2.start(0);
    }

    init();


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
