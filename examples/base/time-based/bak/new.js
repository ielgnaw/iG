(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame
            = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
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
})();

function Circle(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.vx = opts.vx;
    this.vy = opts.vy;
    this.ax = opts.ax;
    this.ay = opts.ay;
    this.radius = opts.radius;
    this.ctx = opts.ctx;
}

Circle.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    this.ctx.fill();
};

Circle.prototype.step = function (dt) {
    // console.warn(dt);
    this.x += this.vx ;// * 0.1;
    this.y += this.vy ;// * 0.1;

    if (this.x - this.radius <= 0 || this.x + this.radius >= this.ctx.canvas.width) {
        this.vx = -this.vx;
    }
    if (this.y - this.radius <= 0 || this.y + this.radius >= this.ctx.canvas.height) {
        this.vy = -this.vy;
    }
};

var canvas = document.querySelector('#canvas');

/**
 * Behaves the same as setInterval except uses requestAnimationFrame() where possible for better performance
 * @param {function} fn The callback function
 * @param {int} delay The delay in milliseconds
 */
window.requestInterval = function(fn, delay) {
    if( !window.requestAnimationFrame       &&
        !window.webkitRequestAnimationFrame &&
        !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
        !window.oRequestAnimationFrame      &&
        !window.msRequestAnimationFrame )
        return window.setInterval(fn, delay);

    var start = new Date().getTime(),
        handle = new Object();

    function loop() {
        var current = new Date().getTime(),
            delta = current - start;

        if(delta >= delay) {
            fn.call();
            start = new Date().getTime();
        }

        handle.value = requestAnimationFrame(loop);
    };

    handle.value = requestAnimationFrame(loop);
    return handle;
}

/**
 * Behaves the same as clearInterval except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {int|object} fn The callback function
 */
window.clearRequestInterval = function(handle) {
    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
    window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
    window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
    window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value) :
    window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
    clearInterval(handle);
};

// window.requestInterval(function () {
//     console.warn(1);
// }, 2000);


/**
 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
 * @param {function} fn The callback function
 * @param {int} delay The delay in milliseconds
 */

window.requestTimeout = function(fn, delay) {
    if(!window.requestAnimationFrame
        && !window.webkitRequestAnimationFrame
        // Firefox 5 ships without cancel support
        && !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame)
        && !window.oRequestAnimationFrame
        && !window.msRequestAnimationFrame) {
            return window.setTimeout(fn, delay);
    }

    var start = new Date().getTime(),
        handle = new Object();

    function loop(){
        var current = new Date().getTime(),
            delta = current - start;

        delta >= delay ? fn.call() : handle.value = requestAnimationFrame(loop);
    };

    handle.value = requestAnimationFrame(loop);
    return handle;
};

/**
 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {int|object} fn The callback function
 */
window.clearRequestTimeout = function(handle) {
    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
    window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
    window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
    window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value) :
    window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
    clearTimeout(handle);
};

// window.requestTimeout(function () {
//     console.warn(1);
// }, 2000);

function moveDivTimeBasedImprove(div, fps) {
    var left = 0;
    var current = +new Date;
    var previous = +new Date;
    var dt = 1000 / 60;
    var acc = 0;
    var param = 1;

    function loop1() {
        var current = +new Date;
        var passed = current - previous;
        previous = current;
        acc += passed;
        while (acc >= dt) {
            update(dt);
            acc -= dt;
        }
        draw();
    }

    function update(dt) {
        left += param * (dt * 0.1);
        if (left > 270) {
            left = 270;
            param = -1;
        } else if (left < 0) {
            left = 0;
            param = 1;
        }
    }

    function draw() {
        div.style.left = left + 'px';
    }

    // setInterval(loop1, 1000 / fps);
    requestInterval(function (delta) {
        loop1();
    }, 1000 / fps);

}

moveDivTimeBasedImprove(document.getElementById('div7'), 60);
moveDivTimeBasedImprove(document.getElementById('div8'), 30);
moveDivTimeBasedImprove(document.getElementById('div9'), 10);


// function create(fps, loopId) {
//     return new Circle({
//         x: 15,
//         y: 20,
//         vx: 1.5,
//         vy: 0,
//         ax: 1,
//         ay: 0,
//         radius: 15,
//         ctx: canvas.getContext('2d')
//     });
// }

// var c60 = create(60, 6);


// window.APP = window.APP || {};

// APP.pause = function() {
//     window.cancelAnimationFrame(APP.core.animationFrame);
// };

// APP.play = function() {
//     APP.core.then = Date.now();
//     APP.core.frame();
// };


// APP.core = {

//     frame: function() {
//         APP.core.setDelta();
//         APP.core.update();
//         APP.core.render();
//         APP.core.animationFrame = window.requestAnimationFrame(APP.core.frame);
//     },

//     setDelta: function() {
//         APP.core.now = Date.now();
//         APP.core.delta = (APP.core.now - APP.core.then) / 1000; // seconds since last frame
//         APP.core.then = APP.core.now;
//     },

//     update: function() {
//         // console.error(APP.core.delta);
//         // Render updates to browser (draw to canvas, update css, etc.)
//     },

//     render: function() {
//         // circle.step(dt);
//         // console.warn(APP.core.delta);
//         // Update values
//         // var distance = 100 * APP._delta;
//         // APP.thing.x += 100 * APP._delta;
//     }
// };

// APP.play();