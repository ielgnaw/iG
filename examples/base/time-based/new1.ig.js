
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

var motionCoefficient = ig.getConfig('motionCoefficient');
var DT = ig.getConfig('delta');
function move(div, fps) {
    var left = 0;
    var param = 1;

    function update(realDelta, realFps) {
        // console.warn(arguments);
        left += param * motionCoefficient * (DT * 0.1);
        if (left > 270) {
            left = 270;
            param = -1 * motionCoefficient;
        } else if (left < 0) {
            left = 0;
            param = 1 * motionCoefficient;
        }
    }

    function draw(realDelta, realFps) {
        div.style.left = left + 'px';
    }

    var handler = ig.loop({
        fps: fps,
        step: update,
        render: draw
    });

    return handler;
}

var h60 = move(document.getElementById('div7'), 60);
var h30 = move(document.getElementById('div8'), 30);
var h10 = move(document.getElementById('div9'), 10);

// ig.rafTimeout(function () {
//     ig.clearRaf(h10);
//     ig.clearRaf(h60);
// }, 5000);