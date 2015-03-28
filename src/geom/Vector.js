/**
 * @file 二维向量
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var sqrt = Math.sqrt;
    var cos = Math.cos;
    var sin = Math.sin;

    /**
     * 二维向量
     *
     * @param {number} x 向量的 x 分量
     * @param {number} y 向量的 y 分量
     *
     * @constructor
     */
    function Vector(x, y) {
        this.x = x || 0;
        this.y = y || x || 0;
    }

    Vector.prototype = {
        constructor: Vector,

        /**
         * 向量的复制，把待复制的向量复制到当前向量的实例
         *
         * @param {Vector} other 待复制的向量
         *
         * @return {Vector} 当前向量实例
         */
        copy: function (other) {
            this.x = other.x;
            this.y = other.y;
            return this;
        },

        /**
         * 向量的旋转
         *
         * @param {number} angle 角度
         *
         * @return {Vector} 当前向量实例
         */
        rotate: function (angle) {
            var x = this.x;
            var y = this.y;
            var cosValue = cos(angle);
            var sinValue = sin(angle);
            this.x = x * cosValue - y * sinValue;
            this.y = x * sinValue + y * cosValue;
            return this;
        },

        /**
         * 将向量旋转 90 度
         *
         * @return {Vector} 当前向量实例
         */
        perp: function () {
            var x = this.x;
            this.x = this.y;
            this.y = -x;
            return this;
        },

        /**
         * 向量反转，方向取反
         *
         * @return {Vector} 当前向量实例
         */
        reverse: function () {
            this.x = -this.x;
            this.y = -this.y;
            return this;
        },

        /**
         * 标准化，将向量转化为一个单位向量即将向量长度转化为一个单位
         *
         * @return {Vector} 当前向量实例
         */
        normalize: function () {
            var len = this.len();
            if (len > 0) {
                this.x /= len;
                this.y /= len;
            }
            return this;
        },

        /**
         * 向量相加
         *
         * @param {Vector} 待加向量
         *
         * @return {Vector} 当前向量实例
         */
        add: function (other) {
            this.x += other.x;
            this.y += other.y;
            return this;
        },

        /**
         * 向量相减
         *
         * @param {Vector} 待减向量
         *
         * @return {Vector} 当前向量实例
         */
        sub: function (other) {
            this.x -= other.x;
            this.y -= other.y;
            return this;
        },

        /**
         * 向量缩放
         *
         * @param {number} x x 方向缩放因子
         * @param {number} y y 方向缩放因子，如果未设置，那么使用 x 方向的
         *
         * @return {Vector} 当前向量实例
         */
        scale: function (x, y) {
            this.x *= x;
            this.y *= y || x;
            return this;
        },

        /**
         * 当前向量投射到另一个向量
         *
         * @param {Vector} other 投射到的目标向量
         *
         * @return {Vector} 当前向量实例
         */
        project: function (other) {
            var amt = this.dot(other) / other.len2();
            this.x = amt * other.x;
            this.y = amt * other.y;
            return this;
        },

        /**
         * 当前向量投射到另一个向量，单位长度
         *
         * @param {Vector} other 投射到的目标向量
         *
         * @return {Vector} 当前向量实例
         */
        projectN: function (other) {
            var amt = this.dot(other);
            this.x = amt * other.x;
            this.y = amt * other.y;
            return this;
        },

        /**
         * 在轴上反映该向量
         *
         * @param {Vector} axis 轴表示的向量
         *
         * @return {Vector} 当前向量实例
         */
        reflect: function (axis) {
            var x = this.x;
            var y = this.y;

            this.project(axis).scale(2);
            this.x -= x;
            this.y -= y;
            return this;
        },

        /**
         * 在轴上反映该向量（单位向量）
         *
         * @param {Vector} axis 轴表示的单位向量
         *
         * @return {Vector} 当前向量实例
         */
        reflectN: function (axis) {
            var x = this.x;
            var y = this.y;

            this.projectN(axis).scale(2);
            this.x -= x;
            this.y -= y;
            return this;
        },

        /**
         * 当前向量和另一个向量的点积
         *
         * @param {Vector}  另一个向量
         *
         * @return {number} 点积
         */
        dot: function (other) {
            return this.x * other.x + this.y * other.y;
        },

        /**
         * 获取当前向量本身的点积即获取当前向量长度的平方
         *
         * @return {number} 当前向量长度的平方
         */
        len2: function () {
            return this.dot(this);
        },

        /**
         * 获取当前向量的长度
         * A · B = |A| * |B| * Cos(angle)  angle 为向量 A 和向量 B 的夹角值
         * |A| 为向量 A 的模即长度，二维空间中 |A| = sqrt(x * x + y * y)
         *
         * @return {number} 向量的长度
         */
        len: function () {
            return sqrt(this.len2());
        }
    };

    return Vector;

});
