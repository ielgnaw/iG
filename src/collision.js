/**
 * @file 碰撞检测，使用分离轴定理 (Separating Axis Theorem) 检测形状是否相交
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var Vector = require('./geom/Vector');

    var sqrt = Math.sqrt;
    var pow = Math.pow;

    var vectorPool = [];
    for (var i = 0; i < 10; i++) {
        vectorPool.push(new Vector());
    }

    var arrPool = [];
    for (var i = 0; i < 5; i++) {
        arrPool.push([]);
    }

    /**
     * 碰撞后的响应
     */
    function CollideResponse() {
        this.first = null;
        this.second = null;
        this.overlapN = new Vector(); // 重叠的面积即重叠的大小，单位向量
        this.overlapV = new Vector(); // 重叠的面积即重叠的大小，向量
        this.reset();
    }

    CollideResponse.prototype = {
        /**
         * 还原 constructor
         */
        constructor: CollideResponse,

        /**
         * 重置
         *
         * @return {CollideResponse} CollideResponse 实例
         */
        reset: function () {
            this.firstInSecond = true; // first 完全在 second 里面
            this.secondInFirst = true; // second 完全在 first 里面
            this.overlap = Number.MAX_VALUE; // 两个对象相交的面积（this.overlapV 的大小），如果两个对象刚刚碰到那么就是 0
            return this;
        }
    };

    /**
     * 一个实例就够，每次判断相交前调用 reset 即可
     *
     * @type {CollideResponse}
     */
    var collideResponse = new CollideResponse();

    var exports = {};

    /**
     * 检测两个圆形是否相交
     *
     * @param {Circle} firstCircle 第一个圆形
     * @param {Circle} secondCircle 第二个圆形
     * @param {boolean} isShowCollideResponse 是否需要碰撞的响应
     *
     * @return {boolean} 相交的结果
     */
    exports.checkCircleCircle = function (firstCircle, secondCircle, isShowCollideResponse) {
        var differenceV = vectorPool.pop().copy(
            new Vector(secondCircle.x, secondCircle.y)
        ).sub(new Vector(firstCircle.x, firstCircle.y));

        var totalRadius = firstCircle.radius + secondCircle.radius;
        var totalRadiusPow = pow(totalRadius, 2);
        var distancePow = differenceV.len2();

        // 没有相交
        if (distancePow > totalRadiusPow) {
            vectorPool.push(differenceV);
            return false;
        }

        // 相交
        if (isShowCollideResponse) {
            collideResponse.reset();
            var dist = sqrt(distancePow);
            collideResponse.firstCircle = firstCircle;
            collideResponse.secondCircle = secondCircle;
            collideResponse.overlap = totalRadius - dist;
            collideResponse.overlapN.copy(differenceV.normalize());
            collideResponse.overlapV.copy(differenceV).scale(collideResponse.overlap);
            collideResponse.aInB = firstCircle.radius <= secondCircle.radius
                                && dist <= secondCircle.radius - firstCircle.radius;
            collideResponse.bInA = secondCircle.radius <= firstCircle.radius
                                && dist <= firstCircle.radius - secondCircle.radius;

            vectorPool.push(differenceV);
            return collideResponse;
        }
    };

    return exports;

});
