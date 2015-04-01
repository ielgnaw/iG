/* global ig */
window.onload = function () {
    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');

    var game = new ig.Game({
        fps: 30,
        name: 'game1'
    });

    game.init({
        canvas: canvas,
        maximize: true,
        scaleFit: true
    });

    var _defaultFPS;
    var Animation = function (opts) {
        opts = opts || {};
        this.obj = opts.animObj || {};
        this.frames = 0;
        this.timer = undefined;
        this.running = false;
        this.tween = opts.tween || function (t, b, c, d) {
            return t * c / d + b;
        };
        this.isRepeat = !!opts.repeat;

        _defaultFPS = opts.fps || 60;

        this._then = Date.now();
        this._now;
        this._delta;
        this._interval = 1000 / _defaultFPS;
    }

    Animation.prototype = {
        constructor: Animation,

        init: function (props, duration) {
            props = props || {};
            this.curFrame = 0;
            this.initState = {};
            this.duration = duration || 1000;
            this.frames = Math.ceil(this.duration * _defaultFPS / 1000);
            for (var prop in props) {
                this.initState[prop] = {
                    from: parseFloat(this.obj[prop]),
                    to: parseFloat(props[prop])
                };
            }
        },
        repeat: function () {
            var newInitState = {};
            for (var i in this.initState) {
                newInitState[i] = {
                    from: this.initState[i].to,
                    to: this.initState[i].from
                };
            }

            this.curFrame = 0;
            this.initState = newInitState;

            this.play();

        },
        //开始播放
        play: function () {
            var me = this;
            me.running = true;

            if (me.timer) {
                me.stop();
            }
            me.step();
            return me;
        },
        // 停止动画
        stop: function () {
            window.cancelAnimationFrame(this.timer);
            console.warn(this);
        },
        //向后一帧
        next: function() {
            this.stop();
            this.curFrame++;
            this.curFrame = this.curFrame > this.frames ? this.frames: this.curFrame;
            this.step.call(this);
        },
        //向前一帧
        prev: function() {
            this.stop();
            this.curFrame--;
            this.curFrame = this.curFrame < 0 ? 0 : this.curFrame;
            this.step.call(this);
        },
        //跳跃到指定帧并播放
        gotoAndPlay: function(frame) {
            this.stop();
            this.curFrame = frame;
            this.play.call(this);
        },
        //跳到指定帧停止播放
        gotoAndStop: function(frame) {
            this.stop();
            this.curFrame = frame;
            this.step.call(this);
        },
        //进入帧动作
        step: function() {
            var me = this;
            me.timer = window.requestAnimationFrame(
                (function (context) {
                    return function () {
                        me.step.call(me);
                    };
                })(me)
            );
            me._now = Date.now();
            me._delta = me._now - me._then;
            if (me._delta > me._interval) {
                me._then = me._now - (me._delta % me._interval);

                var ds;
                for (var prop in this.initState) {
                    ds = this.tween(this.curFrame, this.initState[prop]['from'], this.initState[prop]['to'] - this.initState[prop]['from'], this.frames).toFixed(2);
                    this.obj[prop] = parseFloat(ds);
                    // console.warn(this.obj);
                }
                me.curFrame++;
                if (me.complete()) {
                    if (me.isRepeat) {
                        me.repeat.call(me);
                    }
                    else {
                        me.stop();
                        me.running = false;
                    }
                    return;
                }
        　　}
        },
        //动画结束
        complete: function() {
            return this.curFrame >= this.frames;
        }
    };

    ig.loadResource(
        [
            {
                id: 'bg',
                src: '../img/bg.jpg'
            },
            {
                id: 'playBut',
                src: '../img/playBut.png'
            }
        ],
        function (resource) {
            var bitmap = new ig.Bitmap({
                x: 150,
                y: 100
                , width: 80
                , height: 80
                , sWidth: 100
                , sHeight: 100
                , image: resource.playBut
                , debug: true
                , mouseEnable: true
            });
            game.createStage({
                name: 'bg'
            }).setParallaxScroll({
                image: resource.bg,
                anims: [
                    {
                        aX: 1,
                        aY: 1
                    },
                    {
                        aX: -1,
                        aY: 1
                    }
                ],
                animInterval: 1000 // 切换 parallax 的间隔，这里指的是帧数间隔
            }).addDisplayObject(bitmap);

            bitmap.update = function () {
                this.moveStep();
            }

            var am = new Animation({
                fps: 30,
                animObj: bitmap
                , repeat: '1'
                , tween: ig.easing.linear
            });
            am.init(
                {
                    x: 180
                    // , y: 200
                },
                1000
            );

            am.play();

            game.start('bg', function () {
                console.log('startCallback');
            })
            .on('gameFPS', function (data) {
                document.querySelector('#fps').innerHTML = 'fps: '+ data.data.fps;
            });
        }
    );
};
