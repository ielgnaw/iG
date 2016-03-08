// Requires requestAnimationFrame polyfill
// https://gist.github.com/1579671

window.APP = window.APP || {};

APP.init = function() {
    APP.setup.createCanvas();
    APP.setup.createObjects();
    APP.setup.initSpeedInput();
    APP.setup.addListeners();
    APP.play();
};

APP.pause = function() {
    window.cancelAnimationFrame(APP.core.animationFrame);
    APP.core.isRunning = false;
};

APP.play = function() {
    if(!APP.core.isRunning) {
        APP.core.then = Date.now();
        APP.core.frame();
        APP.core.isRunning = true;
    }
};

APP.core = {

    frame: function() {
        APP.core.setDelta();
        APP.core.update();
        APP.core.render();
        APP.core.animationFrame = window.requestAnimationFrame(APP.core.frame);
    },

    setDelta: function() {
        APP.core.now = Date.now();
        APP.core.delta = (APP.core.now - APP.core.then) / 1000; // seconds since last frame
        APP.core.then = APP.core.now;
    },

    update: function() {
        APP.workers.moveObjects();
    },

    render: function() {
        APP.workers.clearCanvas();
        APP.workers.renderGraphics();
        APP.workers.renderFrameRate();
    }
};

APP.setup = {

    addListeners: function() {
        // Makes demo responsive for small screens
        window.addEventListener('resize', APP.workers.moveCannon);
    },

    createCanvas: function() {
        APP.canvas = document.createElement('canvas');
        APP.canvas.width = 580;
        APP.canvas.height = 338;
        APP.canvas.ctx = APP.canvas.getContext('2d');
        document.getElementById('canvas-demo').appendChild(APP.canvas);
    },

    createObjects: function() {
        // Create Bullet
        APP.bullet = {
            img: document.createElement('img'),
            x: 460,
            y: 114,
            height: 56,
            width: 64,
            startX: 460,
            speed: 100 // pixels per second
        };
        APP.bullet.img.src = 'http://viget.com/uploads/file/time-based-animation/images/bullet-bill.png';

        // Create Cannon
        APP.cannon = {
            img: document.createElement('img'),
            x: 460,
            y: 110,
            height: 128,
            width: 64
        };
        APP.cannon.img.src = 'http://viget.com/uploads/file/time-based-animation/images/cannon.png';

        // Update start X based on screen size
        APP.workers.moveCannon();
        APP.bullet.x = APP.bullet.startX;

        // Setup framerate display
        APP.framerateDisplay = document.getElementById('framerate');
        APP.framerateDisplay.timer = 0;
    },

    initSpeedInput: function() {

        var updateSpeed = function() {
            APP.bullet.speed = APP.speedInput.value;
        };

        APP.speedInput = document.getElementById('speed-input');
        APP.speedInput.value = APP.bullet.speed;
        APP.speedInput.addEventListener('keyup', updateSpeed);
        APP.speedInput.addEventListener('change', updateSpeed);
    }
};

APP.workers = {

    moveCannon: function() {
        var startX = document.body.clientWidth - 110;
        if(startX > 460) {
            startX = 460;
        }
        APP.cannon.x = startX;
        APP.bullet.startX = startX;
    },

    clearCanvas: function() {
        APP.canvas.ctx.clearRect ( 0, 0, APP.canvas.width, APP.canvas.height);
    },

    moveObjects: function() {
        // Move bullet's x position
        var velocity = APP.bullet.speed * APP.core.delta;
        APP.bullet.x = APP.bullet.x - velocity;

        // Reset when off screen
        if (APP.bullet.x < - APP.bullet.width) {
            APP.bullet.x = APP.bullet.startX;
        }
    },

    renderFrameRate: function() {
        // Render Framerate every 1/4 second
        if(APP.framerateDisplay.timer > 0.25) {
            APP.framerateDisplay.innerHTML = (1/APP.core.delta) | 0; // fast round to whole pixel
            APP.framerateDisplay.timer = 0;
        } else {
            APP.framerateDisplay.timer += APP.core.delta;
        }
    },

    renderGraphics: function() {
        var wholePixelBulletX = (APP.bullet.x + 0.5) | 0;  // fast round to whole pixel
        APP.canvas.ctx.drawImage(APP.bullet.img, wholePixelBulletX, APP.bullet.y, APP.bullet.width, APP.bullet.height);
        APP.canvas.ctx.drawImage(APP.cannon.img, APP.cannon.x, APP.cannon.y, APP.cannon.width, APP.cannon.height);
    }
};

APP.init();