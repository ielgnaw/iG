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

    /**
     * 渲染左边的 inner div
     *
     * @param {HTML.Element} leftContainer 左边的容器
     */
    function renderLeftDiv(leftContainer) {
        $('#left-inner').css({
            width: '150px',
            height: '294px',
            position: 'absolute',
            top: leftContainer.height() / 2 - 294 / 2,
            backgroundImage: 'url(img/example2/jubaopen.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '7px 0',
            right: 0
        })
    }

    /**
     * 渲染右边的 inner div
     *
     * @param {HTML.Element} rightContainer 右边的容器
     */
    function renderRightDiv(rightContainer) {
        $('#right-inner').css({
            width: '150px',
            height: '294px',
            position: 'absolute',
            top: rightContainer.height() / 2 - 294 / 2,
            backgroundImage: 'url(img/example2/jubaopen.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '-143px 0',
            left: 0
        })
    }

    /**
     * 正常页面开始加载游戏逻辑回调
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
        leftDiv.attr('id', 'leftDiv');
        leftDiv.html('<div id="left-inner"></div>')
        $(document.body).append(leftDiv);

        leftDiv.animate(
            {
                width: '50%'
            },
            {
                duration: 3000,
                complete: function () {
                    console.log('complete1');
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
        rightDiv.attr('id', 'rightDiv');
        rightDiv.html('<div id="right-inner"></div>')
        $(document.body).append(rightDiv);

        rightDiv.animate(
            {
                width: '50%'
            },
            {
                duration: 3000,
                complete: function () {
                    var startNode = $('<a>');
                    startNode.attr('href', '#');
                    startNode.addClass('orangellow button');
                    startNode.html('start');
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
                }
            }
        );

        renderRightDiv(rightDiv);
    }

    var exports = {};

    exports.init = function () {
        // setWH();
        console.log(goNode);
        goNode.addEventListener('click', goFunc, false)
    };
    return exports;

});
