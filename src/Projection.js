/**
 * @file 投影类
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    /**
     * 投射对象，用某条轴上的最小值和最大值可表示一段投影
     * 可表示它与另外一段投影是否发生重叠
     *
     * @param {number} min 最小值
     * @param {number} max 最大值
     */
    function Projection(min, max) {
        this.min = min;
        this.max = max;
    }

    Projection.prototype = {
        /**
         * 还原 constructor
         */
        constructor: Projection,

        /**
         * 与另外一段投影是否发生重叠
         *
         * @param {Object} projection 另外一段投影
         *
         * @return {boolean} 是否重叠
         */
        overlaps: function (projection) {
            return this.max > projection.min && this.min < projection.max;
        }
    };

    return Projection;
});
