/**
 * @file Description
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var util = require('common/util');

    /**
     * [buffer description]
     *
     * @param {HTML.Element} elem dom 小碎片节点
     * @param {Object} startStyle 变化前的样式
     * @param {Object} endStyle 变化后的样式
     * @param {Function} doingFunc 小碎片动画过程中的回调函数
     * @param {Function} endFunc 小碎片动画后的回调函数
     * @param {[type]} fs [description]
     *
     * @return {[type]} [description]
     */
    function buffer(elem, startStyle, endStyle, doingFunc, endFunc, fs) {
        if (!fs) {
            fs = 6;
        }

        if (!elem.__last_timer__) {
            elem.__last_timer__ = 0;
        }

        var doingStyle = {};
        var x = 0;
        var v = 0;

        function fnMove() {
            v = Math.ceil((100 - x) / fs);
            x += v;
            for (var i in startStyle) {
                doingStyle[i] = (endStyle[i] - startStyle[i]) * x / 100 + startStyle[i];
            }
            if (doingFunc) {
                doingFunc.call(elem, doingStyle);
            }

            if (Math.abs(v) < 1 && Math.abs(100 - x) < 1) {
                clearInterval(elem.timer);
                if (endFunc) {
                    endFunc.call(elem, endStyle);
                }
            }
        }

        var t = new Date().getTime();

        if (t - elem.__last_timer__ > 20) {
            fnMove();
            elem.__last_timer__ = t;
        }

        clearInterval(elem.timer);

        elem.timer = setInterval(fnMove, 20);
    }

    var lock = true;

    var exports = {};

    /**
     * 爆破 div
     *
     * @param {HTML.Element} originalDiv 需要爆破的 div 源元素
     */
    exports.explode = function (originalDiv) {
        if (!lock) {
            return;
        }

        var imgSrc = originalDiv.getAttribute('imgsrc');

        if (!imgSrc) {
            return;
        }

        lock = false;

        var width = parseInt(originalDiv.style.width, 10) || 300;
        var height = parseInt(originalDiv.style.height, 10) || 150;
        var cw = width / 2;
        var ch = height / 2;

        // originalDiv 横向切分的个数
        var horizontalCount = 10;

        // originalDiv 纵向切分的个数
        var verticalCount = 10;

        var allCount = horizontalCount * verticalCount;

        var aData=[];

        for (var i = 0; i < horizontalCount; i++) {
            for (var j = 0, k = 0; j < verticalCount; j++, k++) {
                aData[i] = {
                    left: width * j / verticalCount,
                    top: height * i / horizontalCount
                };

                var fragmentDiv = document.createElement('div');
                fragmentDiv.style.position = 'absolute';
                fragmentDiv.style.width = Math.ceil(width / verticalCount) + 'px';
                fragmentDiv.style.height = Math.ceil(height / horizontalCount) + 'px';
                fragmentDiv.style.background =
                    'url(' + imgSrc + ') ' + (-aData[i].left) + 'px '+ (-aData[i].top) + 'px no-repeat';
                // fragmentDiv.style.background = 'url('+imgSrc+')';
                fragmentDiv.style.left = aData[i].left + 'px';
                fragmentDiv.style.top = aData[i].top + 'px';
                originalDiv.appendChild(fragmentDiv);

                var targetLeft =
                    ((aData[i].left + width / (2 * verticalCount)) - cw)
                        * util.randomFloat(2, 3)
                        + cw
                        - width / (2 * verticalCount);

                var targetTop =
                    ((aData[i].top + height / (2 * horizontalCount)) - ch)
                        * util.randomFloat(2, 3)
                        + ch
                        - height / (2 * horizontalCount);

                setTimeout(
                    (function (fragmentDiv, targetLeft, targetTop) {
                        return function () {
                            buffer(
                                fragmentDiv,
                                {
                                    left: fragmentDiv.offsetLeft,
                                    top: fragmentDiv.offsetTop,
                                    opacity: 100,
                                    x: 0,
                                    y: 0,
                                    z: 0,
                                    scale: 1,
                                    a: 0
                                },
                                {
                                    left: targetLeft,
                                    top: targetTop,
                                    opacity: 0,
                                    x: util.randomFloat(-180, 180),
                                    y: util.randomFloat(-180, 180),
                                    z: util.randomFloat(-180, 180),
                                    scale: util.randomFloat(1.5, 3),
                                    a: 1
                                },
                                function (doingStyle) {
                                    this.style.left = doingStyle.left + 'px';
                                    this.style.top = doingStyle.top + 'px';
                                    this.style.opacity = doingStyle.opacity / 100;
                                    util.setCSS3Style(
                                        fragmentDiv,
                                        'transform',
                                        'perspective(500px) rotateX('
                                            + doingStyle.x
                                            + 'deg) rotateY('
                                            + doingStyle.y
                                            + 'deg) rotateZ('
                                            + doingStyle.z
                                            + 'deg) scale('
                                            + doingStyle.scale
                                            +')'
                                    );
                                },
                                function () {
                                    setTimeout(
                                        function () {
                                            originalDiv.removeChild(fragmentDiv);
                                        },
                                        200
                                    );
                                    if(--allCount === 0) {
                                        lock = true;
                                    }
                                }, 40
                            );
                        };
                    })(fragmentDiv, targetLeft, targetTop),
                    util.randomFloat(0, 200)
                );
            }
        }
    };

    return exports;

});
