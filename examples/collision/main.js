window.onload = function () {
    var maskerNode = document.querySelector('.masker');
    var loadingNode = document.querySelector('.loading');

    var imageLoader = new ig.ImageLoader({
        allCallback: function () {
            loadComplete();
        },
        source: [
            {
                id: 'billd',
                src: './img/billd.png'
            }
        ]
    });

    imageLoader.on('ImageLoader:imageLoaded', function (data) {
        console.log(data.data.progress.toFixed(0) + '%');
    });

    imageLoader.load();

    var canvas = document.querySelector('#canvas');
    var ctx = canvas.getContext('2d');

    var util = ig.util;
    var DisplayObject = ig.DisplayObject;

    var game;
    var stage;
    var mouseX;
    var mouseY;

    function loadComplete() {
        maskerNode.style.display = 'none';

        game = new ig.Game();
        // debugger
        stage = game.createStage({
            bgColor: '#fff',
            canvas: canvas
        });

        var sp1 = new Sprite({
            image: imageLoader.images.billd,
            // x: canvas.width / 2, // 绘制的形状的左上角的横坐标
            x: 0,
            y: 0, // 绘制的形状的左上角的纵坐标
            zIndex: 1,
            width: 60,
            height: 60
        });

        stage.addDisplayObject(sp1);

        var sp2 = new Sprite({
            image: imageLoader.images.billd,
            // x: canvas.width / 2, // 绘制的形状的左上角的横坐标
            x: canvas.width / 2,
            y: canvas.height / 2, // 绘制的形状的左上角的纵坐标
            zIndex: 1,
            width: 60,
            height: 60
        });

        stage.addDisplayObject(sp2);

        canvas.addEventListener('touchstart', function (e) {
            console.warn(e, 'touchstart');
            debugger
            sp1.checkDrag();
            sp2.checkDrag();
        }, false);

        canvas.addEventListener('touchmove', function (e) {
            console.warn(e, 'touchmove');
            var touchEvent = event.touches[0];
            var pos = util.getMouseCoords(canvas, touchEvent);
            console.warn(pos);
            // mouseX = e.clientX  - canvasX;
            // mouseY = e.clientY - canvasY;
            mouseX = pos.x;
            mouseY = pos.y;

            sp1.update();
            sp2.update();
            if (sp1.hitTest(sp2)) {
                sp1.alpha = .5;
            }
            else {
                sp1.alpha = 1;
            }
        }, false);

        canvas.addEventListener('touchend', function (e) {
            console.warn(e, 'touchend');
            sp1.isDrag = false;
            sp2.isDrag = false;
        }, false);

        // document.onmousemove = function (e) {
        //     var pos = util.getMouseCoords(canvas, e);
        //     // mouseX = e.clientX  - canvasX;
        //     // mouseY = e.clientY - canvasY;
        //     mouseX = pos.x;
        //     mouseY = pos.y;

        //     sp1.update();
        //     sp2.update();
        //     if (sp1.hitTest(sp2)) {
        //         sp1.alpha = .5;
        //     }
        //     else {
        //         sp1.alpha = 1;
        //     }
        // }

        // document.onmouseup = function(e){
        //     sp1.isDrag = false;
        //     sp2.isDrag = false;
        // }

        // document.onmousedown = function(e){
        //     sp1.checkDrag();
        //     sp2.checkDrag();
        // }

        game.start();
    }

    function Sprite(opts) {
        opts = opts || {};

        if (!opts.image) {
            throw new Error('SpriteSheet must be require a image param');
        }

        DisplayObject.apply(this, arguments);

        this.halfWidth = this.width/2;
        this.halfHeight = this.height/2;
        this.isDrag = false;
        this.offset = {
            x: 0,
            y: 0
        };
    }

    Sprite.prototype = {
        constructor: Sprite,
        render: function () {
            ctx.save();
            ctx.translate(this.x + this.halfWidth, this.y + this.halfHeight);
            ctx.globalAlpha = this.alpha;
            ctx.rotate(this.angle);
            ctx.scale(this.scaleX, this.scaleY);
            ctx.drawImage(this.image, -this.halfWidth, -this.halfHeight);
            ctx.restore();
        },
        hitTest: function (sprite) {
            var minx = this.x > sprite.x ? this.x : sprite.x;
            var maxx = this.x + this.width < sprite.x + sprite.width ? this.x + this.width : sprite.x + sprite.width ;
            var miny = this.y > sprite.y ? this.y : sprite.y;
            var maxy = this.y + this.width < sprite.y + sprite.width ? this.y + this.width : sprite.y + sprite.width;

            if (minx >= maxx || miny >= maxy) {
                return false;
            }

            /*第一种方法*/
            ctx.drawImage(this.image, this.x, this.y);
            var data1 = ctx.getImageData(minx, miny, maxx - minx, maxy - miny).data;
            ctx.clearRect(0, 0, 550, 400);
            ctx.drawImage(sprite.image, sprite.x, sprite.y);
            var data2 = ctx.getImageData(minx, miny, maxx - minx, maxy - miny).data;

            for(var i = 3; i < data1.length; i += 4)
            {
                if(data1[i] > 0 && data2[i] > 0) return true;
            }
            return false;

            /*第二种方法
            ctx.drawImage(this.image, this.x, this.y);
            ctx.globalCompositeOperation = 'source-in';
            ctx.drawImage(sprite.image, sprite.x, sprite.y);
            var data = ctx.getImageData(minx, miny, maxx - minx, maxy - miny).data;
            ctx.globalCompositeOperation = 'source-over';

            for(var i = 3; i < data.length; i += 4)
            {

                if(data[i] > 0 ) return true;
            }
            return false;*/
        },
        checkDrag: function () {
            if (mouseX > this.x && mouseX < this.x + this.width && mouseY > this.y && mouseY < this.y + this.height) {
                this.isDrag = true;
                this.offset.x = this.x - mouseX;
                this.offset.y = this.y - mouseY;
            }
        },
        update: function () {
            if (this.isDrag) {
                this.x = mouseX + this.offset.x;
                this.y = mouseY + this.offset.y;
            }
        }
    };
    util.inherits(Sprite, DisplayObject);

};
