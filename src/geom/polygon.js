/**
 * @file 顺时针方向凸多边形
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    'use strict';

    var collision = require('../collision');
    var Vector = require('./Vector');

    var polygon = {};

    /**
     * 重新计算多边形的边和法线，当多边形的点序列被改变以及获取边或法线时被调用
     *
     * @param {Object} obj 对象
     *
     * @return {Object} obj 对象本身
     */
    polygon.recalc = function (obj) {
        var points = obj.points;
        var len = points.length;
        obj.edges = []; // 边
        obj.normals = []; // 法线
        for (var i = 0; i < len; i++) {
            var p1 = points[i];
            var p2 = i < len - 1 ? points[i + 1] : points[0];
            var e = new Vector().copy(p2).sub(p1);
            var n = new Vector().copy(e).perp().normalize();
            obj.edges.push(e);
            obj.normals.push(n);
        }
        return obj;
    };

    /**
     * 把一个具有 x, y, width, height 的矩形转换成 polygon
     *
     * @param {Object} obj 对象
     *
     * @return {Object} obj 对象本身
     */
    polygon.toPolygon = function (obj) {
        var w = obj.width;
        var h = obj.height;
        obj.points = [
            {
                x: 0,
                y: 0
            },
            {
                x: w,
                y: 0
            },
            {
                x: w,
                y: h
            },
            {
                x: 0,
                y: h
            }
        ];
        polygon.recalc(obj);

        return obj;
    };

    /**
     * 最大最小顶点法来获取边界盒，碰撞时，根据此边界盒判断
     *
     * @param {Object} obj 对象
     *
     * @return {Object} obj 对象本身
     */
    polygon.getBounds = function (obj) {
        var points = obj.points;
        var startX = obj.x;
        var startY = obj.y;

        var points = obj.points;
        var startX = obj.x;
        var startY = obj.y;

        var minX = Number.MAX_VALUE;
        var maxX = Number.MIN_VALUE;
        var minY = Number.MAX_VALUE;
        var maxY = Number.MIN_VALUE;

        for (var i = 0, len = points.length; i < len; i++) {
            if (points[i].x < minX) {
                minX = points[i].x;
            }
            if (points[i].x > maxX) {
                maxX = points[i].x;
            }
            if (points[i].y < minY) {
                minY = points[i].y;
            }
            if (points[i].y > maxY) {
                maxY = points[i].y;
            }
        }

        obj.bounds = {
            x: minX + startX,
            y: minY + startY,
            width: maxX - minX,
            height: maxY - minY
        };

        return obj;
    };

    /**
     * 是否和另一个多边形相交
     *
     * @param {Object} firstPolygon 一个多边形
     * @param {Object} secondPolygon 另一个多边形
     * @param {boolean} isShowCollideResponse 是否需要碰撞的响应
     *
     * @return {boolean} 是否相交
     */
    polygon.intersects = function (firstPolygon, secondPolygon, isShowCollideResponse) {
        return collision.checkPolygonPolygon(firstPolygon, secondPolygon, isShowCollideResponse);
    };

    /**
     * 是否和另一个圆形相交
     *
     * @param {Object} firstPolygon 一个多边形
     * @param {Polygon} otherCircle 另一个圆形
     * @param {boolean} isShowCollideResponse 是否需要碰撞的响应
     *
     * @return {boolean} 是否相交
     */
    polygon.intersectsCircle = function (firstPolygon, otherCircle, isShowCollideResponse) {
        return collision.checkPolygonCircle(firstPolygon, otherCircle, isShowCollideResponse);
    };

    return polygon;
});
