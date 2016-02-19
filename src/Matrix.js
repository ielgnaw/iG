/**
 * @file Matrix 类
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    var util = require('./util');

    var cos = Math.cos;
    var sin = Math.sin;

    /**
     * Matrix 基类
     *
     * @constructor
     *
     * @return {Object} Matrix 实例
     */
    function Matrix() {
        this.m = [1, 0, 0, 1, 0, 0];
        return this;
    }

    var p = Matrix.prototype;

    /**
     * 重置
     *
     * @return {Object} Matrix 实例
     */
    p.reset = function () {
        this.m = [1, 0, 0, 1, 0, 0];
        return this;
    };

    /**
     * 矩阵左乘
     *
     * @param {Object} matrix 矩阵
     *
     * @return {Object} Matrix 实例
     */
    p.mul = function (matrix) {
        var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
        var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];

        var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
        var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

        var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
        var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        this.m[4] = dx;
        this.m[5] = dy;

        return this;
    };

    /**
     * 矩阵翻转
     *
     * @return {Object} Matrix 实例
     */
    p.invert = function () {
        var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
        var m0 = this.m[3] * d;
        var m1 = -this.m[1] * d;
        var m2 = -this.m[2] * d;
        var m3 = this.m[0] * d;
        var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
        var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
        this.m[0] = m0;
        this.m[1] = m1;
        this.m[2] = m2;
        this.m[3] = m3;
        this.m[4] = m4;
        this.m[5] = m5;

        return this;
    };

    /**
     * 旋转
     *
     * @param {number} angle 角度值
     *
     * @return {Object} Matrix 实例
     */
    p.rotate = function (angle) {
        var rad = util.deg2Rad(angle);
        var c = cos(rad);
        var s = sin(rad);
        var m11 = this.m[0] * c + this.m[2] * s;
        var m12 = this.m[1] * c + this.m[3] * s;
        var m21 = this.m[0] * -s + this.m[2] * c;
        var m22 = this.m[1] * -s + this.m[3] * c;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        return this;
    };

    /**
     * 平移
     *
     * @param {number} x 横轴距离
     * @param {number} y 纵轴距离
     *
     * @return {Object} Matrix 实例
     */
    p.translate = function (x, y) {
        this.m[4] += this.m[0] * x + this.m[2] * y;
        this.m[5] += this.m[1] * x + this.m[3] * y;
        return this;
    };

    /**
     * 缩放
     *
     * @param {number} sx 横轴缩放因子
     * @param {number} sy 纵轴缩放因子
     *
     * @return {Object} Matrix 实例
     */
    p.scale = function (sx, sy) {
        this.m[0] *= sx;
        this.m[1] *= sx;
        this.m[2] *= sy;
        this.m[3] *= sy;

        // this.m[4] *= sx;
        // this.m[5] *= sy;
        return this;
    };

    /**
     * 转换点坐标，矩阵左乘向量
     *
     * @param {number} px 横坐标
     * @param {number} py 纵坐标
     *
     * @return {Object} 转换后的坐标
     */
    p.transformPoint = function (px, py) {
        var x = px;
        var y = py;
        px = x * this.m[0] + y * this.m[2] + this.m[4];
        py = x * this.m[1] + y * this.m[3] + this.m[5];

        return {
            x: px,
            y: py
        };
    };

    /**
     * 设置 ctx 的完整 transform
     *
     * @param {Object} ctx canvas 2d context 对象
     */
    p.setCtxTransform = function (ctx) {
        var m = this.m;
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    };

    return Matrix;
});
