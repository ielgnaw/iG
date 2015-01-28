/**
 * @file example1
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var $ = require('jquery');

    var Frame = require('common/Frame');
    var Circle = require('common/shape/Circle');
    var Rect = require('common/shape/Rect');
    var util = require('common/util');

    var goNode = document.querySelector('#go');

    // 开场动画间隔时间
    var TIME = 2000;

    /**
     * 游戏资源图片
     * 类型 A 指掉落的
     * 类型 B 是本体
     *
     * @type {Array}
     */
    var gameImgList = [
        {
            type: 'A',
            url: 'img/example2/jinyuanbao.png'
        },
        {
            type: 'A',
            url: 'img/example2/ball1.png'
        },
        {
            type: 'B',
            url: 'img/example2/wan.png'
        }
    ];

    var imgs = [];

    /**
     * 加载游戏图片资源
     * 在开场动画的时候就做这件事
     */
    function loadGameImgs() {
        for (var i = 0, len = gameImgList.length; i < len; i++) {
            var img = new Image();
            img.src = gameImgList[i].url;
            imgs.push({
                type: gameImgList[i].type,
                img: img
            });
        }
    }

    /**
     * 渲染左边的 inner div
     *
     * @param {HTML.Element} leftContainer 左边的容器
     */
    function renderLeftDiv(leftContainer) {
        $('#left-inner').css({
            width: '157px',
            height: '294px',
            position: 'absolute',
            top: leftContainer.height() / 2 - 294 / 2,
            backgroundImage: 'url(img/example2/jubaopen.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '7px 0',
            right: 0
        });
        $('#left-inner').attr('imgsrc', 'img/example2/jubaopen.png')
    }

    /**
     * 渲染右边的 inner div
     *
     * @param {HTML.Element} rightContainer 右边的容器
     */
    function renderRightDiv(rightContainer) {
        $('#right-inner').css({
            width: '157px',
            height: '294px',
            position: 'absolute',
            top: rightContainer.height() / 2 - 294 / 2,
            backgroundImage: 'url(img/example2/jubaopen.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '-150px 0',
            left: 0
        });
        $('#right-inner').attr('imgsrc', 'img/example2/jubaopen.png')
    }

    /**
     * 正常页面开始加载游戏逻辑的回调
     *
     * @param {MouseEvent} e 事件对象
     */
    function goFunc(e) {
        e.stopPropagation();
        e.preventDefault();
        var leftDiv = $('<div></div>');
        leftDiv.css({
            height: '100%',
            width: '0',
            position: 'absolute',
            backgroundImage: 'url(img/example2/bg.jpg)',
            top: 0,
            left: 0,
            bottom: 0
        });
        leftDiv.attr('id', 'left-div');
        leftDiv.html('<div id="left-inner"></div>')
        $(document.body).append(leftDiv);

        leftDiv.animate(
            {
                width: '50%'
            },
            {
                duration: TIME,
                complete: function () {
                    // console.log('complete1');
                }
            }
        );

        renderLeftDiv(leftDiv);

        var rightDiv = $('<div></div>');
        rightDiv.css({
            height: '100%',
            width: '0',
            position: 'absolute',
            backgroundImage: 'url(img/example2/bg.jpg)',
            top: 0,
            right: 0,
            bottom: 0
        });
        rightDiv.attr('id', 'right-div');
        rightDiv.html('<div id="right-inner"></div>')
        $(document.body).append(rightDiv);

        rightDiv.animate(
            {
                width: '50%'
            },
            {
                duration: TIME,
                complete: function () {
                    var startNode = $('<a>');
                    startNode.attr('href', '#');
                    startNode.addClass('orangellow button');
                    startNode.html('start');
                    startNode.attr('id', 'start-game');
                    startNode.css({
                        'display': 'inline-block',
                        'width': '100px',
                        'height': '30px',
                        'color': '#fff',
                        'line-height': '30px',
                        'text-align': 'center',
                        'position': 'relative',
                        'top': parseInt($('#right-inner').height(), 10) + parseInt($('#right-inner').css('top'), 10) + 50,
                        'left': '-50px'
                    });
                    rightDiv.append(startNode);

                    startNode.on('click', startGameFunc);
                    // require('./start').init();

                }
            }
        );

        renderRightDiv(rightDiv);
    }

    /**
     * 开始游戏按钮回调
     *
     * @param {jQuery.Event} e jQuery 事件对象
     */
    function startGameFunc(e) {
        e.stopPropagation();
        e.preventDefault();

        $('#left-div').remove();
        $('#right-div').remove();
        var canvas = $('<canvas>');
        canvas.attr('id', 'canvas');
        canvas.attr('width', $(document).width());
        canvas.attr('height', $(document).height());
        canvas.css({
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
        });
        $(document.body).append(canvas);

        var scoreDiv = $(''
            + '<div class="score-container">'
            +   '分数：'
            +   '<div class="score">0</div>'
            + '</div>'
        );
        scoreDiv.css({
            color: '#fff'
        });
        $(document.body).append(scoreDiv);

        var countdownDiv = $(''
            + '<div class="countdown-container">'
            +   '<div class="countdown"></div>'
            + '</div>'
        );
        countdownDiv.css({
            color: '#fff'
        });
        $(document.body).append(countdownDiv);

        var start = require('./start');

        start.init(imgs, function (func) {
            var countdownNode = $('.countdown');
            var countdown = 20;
            var t = setInterval(function () {
                if (countdown <= 0) {
                    clearInterval(t);
                    countdown = 0;
                    countdownNode.html(countdown);
                    start.dispose();
                }
                countdownNode.html(countdown);
                countdown = (countdown - .1).toFixed(1);
            }, 100);
        });
    }

    var exports = {};

    exports.init = function () {
        loadGameImgs();
        goNode.addEventListener('click', goFunc, false);
    };

    return exports;

});
