/**
 * @file 碰撞检测，使用分离轴定理 (Separating Axis Theorem) 检测形状是否相交
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var Vector = require('./geom/Vector');

    var sqrt = Math.sqrt;
    var pow = Math.pow;
    var abs = Math.abs;

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

    function flattenPointsOn(points, normal, result) {
        var min = Number.MAX_VALUE;
        var max = -Number.MAX_VALUE;
        var i = points.length;
        while (i--) {
            // Get the magnitude of the projection of the point onto the normal
            var dot = new Vector(points[i].x, points[i].y).dot(normal);
            if (dot < min) min = dot;
            if (dot > max) max = dot;
        }
        result[0] = min;
        result[1] = max;
    };

    function isSeparatingAxis(aPos, bPos, aPoints, bPoints, axis, response) {
        var rangeA = arrPool.pop();
        var rangeB = arrPool.pop();

        // Get the magnitude of the offset between the two polygons
        var offsetV = vectorPool.pop().copy(bPos).sub(aPos);
        var projectedOffset = offsetV.dot(axis);

        // Project the polygons onto the axis.
        flattenPointsOn(aPoints, axis, rangeA);
        flattenPointsOn(bPoints, axis, rangeB);

        // Move B's range to its position relative to A.
        rangeB[0] += projectedOffset;
        rangeB[1] += projectedOffset;

        // Check if there is a gap. If there is, this is a separating axis and we can stop
        if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
            vectorPool.push(offsetV);
            arrPool.push(rangeA);
            arrPool.push(rangeB);
            return true;
        }

        // If we're calculating a response, calculate the overlap.
        if (response) {
            var overlap = 0;
            // A starts further left than B
            if (rangeA[0] < rangeB[0]) {
                response.firstInSecond = false;
                // A ends before B does. We have to pull A out of B
                if (rangeA[1] < rangeB[1]) {
                    overlap = rangeA[1] - rangeB[0];
                    response.secondInFirst = false;
                    // B is fully inside A.  Pick the shortest way out.
                } else {
                    var option1 = rangeA[1] - rangeB[0];
                    var option2 = rangeB[1] - rangeA[0];
                    overlap = option1 < option2 ? option1 : -option2;
                }
                // B starts further left than A
            } else {
                response.secondInFirst = false;
                // B ends before A ends. We have to push A out of B
                if (rangeA[1] > rangeB[1]) {
                    overlap = rangeA[0] - rangeB[1];
                    response.firstInSecond = false;
                    // A is fully inside B.  Pick the shortest way out.
                } else {
                    var option1 = rangeA[1] - rangeB[0];
                    var option2 = rangeB[1] - rangeA[0];
                    overlap = option1 < option2 ? option1 : -option2;
                }
            }

            // If this is the smallest amount of overlap we've seen so far, set it as the minimum overlap.
            var absOverlap = abs(overlap);
            if (absOverlap < response.overlap) {
                response.overlap = absOverlap;
                response.overlapN.copy(axis);
                if (overlap < 0) {
                    response.overlapN.reverse();
                }
            }
        }

        vectorPool.push(offsetV);
        arrPool.push(rangeA);
        arrPool.push(rangeB);
        return false;
    }

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

        var totalRadius = firstCircle.radius * firstCircle.scaleX + secondCircle.radius * secondCircle.scaleX;
        // var totalRadius = firstCircle.radius + secondCircle.radius;
        var totalRadiusPow = pow(totalRadius, 2);
        var distancePow = differenceV.len2();
        // console.warn(distancePow);

        // 没有相交
        if (distancePow > totalRadiusPow) {
            vectorPool.push(differenceV);
            return false;
        }

        // 相交
        if (isShowCollideResponse) {
            collideResponse.reset();
            var dist = sqrt(distancePow);
            collideResponse.first = firstCircle;
            collideResponse.second = secondCircle;
            collideResponse.overlap = totalRadius - dist;
            collideResponse.overlapN.copy(differenceV.normalize());
            collideResponse.overlapV.copy(differenceV).scale(collideResponse.overlap);
            collideResponse.firstInSecond = firstCircle.radius <= secondCircle.radius
                                && dist <= secondCircle.radius - firstCircle.radius;
            collideResponse.secondInFirst = secondCircle.radius <= firstCircle.radius
                                && dist <= firstCircle.radius - secondCircle.radius;

            vectorPool.push(differenceV);
            return collideResponse;
        }
    };

    /**
     * 检测两个多边形是否相交
     *
     * @param {Polygon} firstPolygon 第一个多边形
     * @param {Polygon} secondPolygon 第二个多边形
     * @param {boolean} isShowCollideResponse 是否需要碰撞的响应
     *
     * @return {boolean} 相交的结果
     */
    exports.checkPolygonPolygon = function (firstPolygon, secondPolygon, isShowCollideResponse) {
        var aPoints = firstPolygon.points;
        var aLen = aPoints.length;
        var bPoints = secondPolygon.points;
        var bLen = bPoints.length;

        var firstPos = {
            x: firstPolygon.x,
            y: firstPolygon.y
        };

        var secondPos = {
            x: secondPolygon.x,
            y: secondPolygon.y
        };

        var response = null;
        if (isShowCollideResponse) {
            response = collideResponse.reset();
        }

        // If any of the edge normals of A is a separating axis, no intersection.
        while (aLen--) {
            if (isSeparatingAxis(firstPos, secondPos, aPoints, bPoints, firstPolygon.normals[aLen], response)) {
                return false;
            }
        }

        // If any of the edge normals of B is a separating axis, no intersection.
        while (bLen--) {
            if (isSeparatingAxis(firstPos, secondPos, aPoints, bPoints, secondPolygon.normals[bLen], response)) {
                return false;
            }
        }

        // Since none of the edge normals of A or B are a separating axis, there is an intersection
        // and we've already calculated the smallest overlap (in isSeparatingAxis).  Calculate the
        // final overlap vector.
        if (response) {
            response.first = firstPolygon;
            response.second = secondPolygon;
            response.overlapV.copy(response.overlapN).scale(response.overlap);
        }
        return response;
    };

    return exports;

});
