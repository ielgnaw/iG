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

    var LEFT_VORNOI_REGION = -1;

    var MIDDLE_VORNOI_REGION = 0;

    var RIGHT_VORNOI_REGION = 1;

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
            // 投射到法线上的点的位置
            var dot = new Vector(points[i].x, points[i].y).dot(normal);
            if (dot < min) {
                min = dot;
            }
            if (dot > max) {
                max = dot;
            }
        }
        result[0] = min;
        result[1] = max;
    }

    /**
     * 检测两个顺时针凸多边形是否由指定轴分离
     *
     * @param {Object} aPos 第一个多边形的起点坐标对象
     * @param {Object} bPos 第二个多边形的起点坐标对象
     * @param {Array} aPoints 第一个多边形的顶点数组
     * @param {Array} bPoints 第二个多边形的顶点数组
     * @param {Vector} axis 指定的轴，指多边形的某条边
     * @param {CollideResponse} response CollideResponse 实例
     *
     * @return {boolean} 是否是分离轴，如果为 true，则说明两个多边形不相交
     */
    function isSeparatingAxis(aPos, bPos, aPoints, bPoints, axis, response) {
        var rangeA = arrPool.pop();
        var rangeB = arrPool.pop();

        // 两个多边形的偏移量的大小
        var offsetV = vectorPool.pop().copy(bPos).sub(aPos);
        var projectedOffset = offsetV.dot(axis);

        // 投影多边形上的点到 axis
        flattenPointsOn(aPoints, axis, rangeA);
        flattenPointsOn(bPoints, axis, rangeB);

        rangeB[0] += projectedOffset;
        rangeB[1] += projectedOffset;

        // 检测是否有空隙，如果有，那么 axis 是一个分离轴
        if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
            vectorPool.push(offsetV);
            arrPool.push(rangeA);
            arrPool.push(rangeB);
            return true;
        }

        if (response) {
            var overlap = 0;
            // firstPolygon 在 secondPolygon 左边
            if (rangeA[0] < rangeB[0]) {
                response.firstInSecond = false;
                // firstPolygon 比 secondPolygon 提前结束，要把 firstPolygon 从 secondPolygon 中完全抽离出来的距离
                if (rangeA[1] < rangeB[1]) {
                    overlap = rangeA[1] - rangeB[0];
                    response.secondInFirst = false;
                }
                // secondPolygon 完全在 firstPolygon 里面
                else {
                    var option1 = rangeA[1] - rangeB[0];
                    var option2 = rangeB[1] - rangeA[0];
                    overlap = option1 < option2 ? option1 : -option2;
                }
            }
            // secondPolygon 在 firstPolygon 左边
            else {
                response.secondInFirst = false;
                // secondPolygon 比 firstPolygon 提前结束，要把 firstPolygon 从 secondPolygon 中完全推出去的距离
                if (rangeA[1] > rangeB[1]) {
                    overlap = rangeA[0] - rangeB[1];
                    response.firstInSecond = false;
                }
                // firstPolygon 完全在 secondPolygon 里面
                else {
                    var option1 = rangeA[1] - rangeB[0];
                    var option2 = rangeB[1] - rangeA[0];
                    overlap = option1 < option2 ? option1 : -option2;
                }
            }

            // 获取最小的 overlap
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
     * 计算 Voronoi 图（泰森多边形）区域里的点，相对于(0， 0)
     *
     * @param {Vector} line 线
     * @param {Vector} point 点
     *
     * @return {number} 结果  -1 左边, 0  中间, 1  右边
     */
    function vornoiRegion(line, point) {
        var len2 = line.len2();
        var dp = point.dot(line);

        if (dp < 0) {
            return LEFT_VORNOI_REGION;
        }
        if (dp > len2) {
            return RIGHT_VORNOI_REGION;
        }
        return MIDDLE_VORNOI_REGION;
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
        var firstPoints = firstPolygon.points;
        var firstLen = firstPoints.length;
        var secondPoints = secondPolygon.points;
        var secondLen = secondPoints.length;

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

        // 循环检测 firstPolygon 的每条边和法线，如果任何一个是分离轴，那么不会相交
        while (firstLen--) {
            if (
                isSeparatingAxis(
                    firstPos, secondPos, firstPoints, secondPoints, firstPolygon.normals[firstLen], response
                )
            ) {
                return false;
            }
        }

        // 循环检测 secondPolygon 的每条边和法线，如果任何一个是分离轴，那么不会相交
        while (secondLen--) {
            if (
                isSeparatingAxis(
                    firstPos, secondPos, firstPoints, secondPoints, secondPolygon.normals[secondLen], response
                )
            ) {
                return false;
            }
        }

        // firstPolygon 和 secondPolygon 中，没有任何一条边或者法线是分离轴，那么他俩一定有交叉点
        // 在 isSeparatingAxis 方法中已经算出相交的最小面积（大小），这里计算最终的重叠的向量
        if (response) {
            response.first = firstPolygon;
            response.second = secondPolygon;
            response.overlapV.copy(response.overlapN).scale(response.overlap);
        }
        return response;
    };

    /**
     * 检测多边形和圆形是否相交
     *
     * @param {Polygon} polygon 多边形
     * @param {Circle} circle 圆形
     * @param {boolean} isShowCollideResponse 是否需要碰撞的响应
     *
     * @return {boolean} 是否相交
     */
    exports.checkPolygonCircle = function (polygon, circle, isShowCollideResponse) {
        var circlePos = vectorPool.pop().copy(new Vector(circle.x, circle.y)).sub(new Vector(polygon.x, polygon.y));
        var radius = circle.radius;
        var radius2 = radius * radius;
        var points = polygon.points;
        var len = points.length;
        var edge = vectorPool.pop();
        var point = vectorPool.pop();

        var response = null;
        if (isShowCollideResponse) {
            response = collideResponse.reset();
        }

        // 遍历多边形每条边
        for (var i = 0; i < len; i++) {
            var next = (i === len - 1) ? 0 : i + 1;
            var prev = (i === 0) ? len - 1 : i - 1;
            var overlap = 0;
            var overlapN = null;

            edge.copy(polygon.edges[i]);

            // 圆心相对于边的起点
            point.copy(circlePos).sub(points[i]);

            // 圆心到多边形这个点的距离大于半径，那么多边形一定不是完全在圆里面
            if (response && point.len2() > radius2) {
                response.firstInSecond = false;
            }

            // 得到圆的点相对于线的方位
            var region = vornoiRegion(edge, point);

            // LEFT_VORNOI_REGION 左边
            if (region === LEFT_VORNOI_REGION) {

                // 保证在前一条边时在右侧
                edge.copy(polygon.edges[prev]);

                // 圆的中心相对于前一条边的起点
                var point2 = vectorPool.pop().copy(circlePos).sub(points[prev]);

                region = vornoiRegion(edge, point2);

                // 在区域里面了，判断是否相交
                if (region === RIGHT_VORNOI_REGION) {
                    var dist = point.len();
                    // 不相交
                    if (dist > radius) {
                        vectorPool.push(circlePos);
                        vectorPool.push(edge);
                        vectorPool.push(point);
                        vectorPool.push(point2);
                        return false;
                    }
                    // 相交，计算 overlap
                    else if (response) {
                        response.secondInFirst = false;
                        overlapN = point.normalize();
                        overlap = radius - dist;
                    }
                }
                vectorPool.push(point2);
            }
            // RIGHT_VORNOI_REGION 右边
            else if (region === RIGHT_VORNOI_REGION) {

                // 保证在下一条边时在左侧
                edge.copy(polygon.edges[next]);

                // 圆的中心相对于下一条边的起点
                point.copy(circlePos).sub(points[next]);

                region = vornoiRegion(edge, point);

                // 在区域里面了，判断是否相交
                if (region === LEFT_VORNOI_REGION) {
                    var dist = point.len();

                    // 不相交
                    if (dist > radius) {
                        vectorPool.push(circlePos);
                        vectorPool.push(edge);
                        vectorPool.push(point);
                        return false;
                    }
                    // 相交，计算 overlap
                    else if (response) {
                        response.secondInFirst = false;
                        overlapN = point.normalize();
                        overlap = radius - dist;
                    }
                }
            }
            // MIDDLE_VORNOI_REGION 中间
            else {
                // 检测圆是否和边相交，边需要 normalize 化
                var normal = edge.perp().normalize();

                // 获取圆和边的中心的垂直距离
                var dist = point.dot(normal);
                var distAbs = abs(dist);

                // 圆在边外部，没有相交
                if (dist > 0 && distAbs > radius) {
                    vectorPool.push(circlePos);
                    vectorPool.push(normal);
                    vectorPool.push(point);
                    return false;
                }
                // 相交，计算 overlap
                else if (response) {
                    overlapN = normal;
                    overlap = radius - dist;
                    // 圆心在边的外侧或者圆的一部分在边的外侧，那么圆不是完全在多边形内部
                    if (dist >= 0 || overlap < 2 * radius) {
                        response.secondInFirst = false;
                    }
                }
            }

            // 获取最小的 overlap
            // 这里如果圆在错误的区域，那么 overlapN 是 null
            if (overlapN && response && abs(overlap) < abs(response.overlap)) {
                response.overlap = overlap;
                response.overlapN.copy(overlapN);
            }
        }

        if (response) {
            response.a = polygon;
            response.b = circle;
            response.overlapV.copy(response.overlapN).scale(response.overlap);
        }

        vectorPool.push(circlePos);
        vectorPool.push(edge);
        vectorPool.push(point);
        return response;
    };

    /**
     * 检测圆形和多边形是否相交，比 checkPolygonPolygon 速度慢一些，因为有 reverse 操作
     *
     * @param {Circle} circle 圆形
     * @param {Polygon} polygon 多边形
     * @param {boolean} isShowCollideResponse 是否需要碰撞的响应
     *
     * @return {boolean} 是否相交
     */
    exports.checkCirclePolygon = function (circle, polygon, isShowCollideResponse) {
        var result = exports.checkPolygonCircle(polygon, circle, isShowCollideResponse);
        if (result) {
            var first = result.first;
            var firstInSecond = result.firstInSecond;
            result.overlapN.reverse();
            result.overlapV.reverse();
            result.first = result.second;
            result.second = first;
            result.firstInSecond = result.secondInFirst;
            result.secondInFirst = firstInSecond;
        }
        return result;
    };

    return exports;

});
