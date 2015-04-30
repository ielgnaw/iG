/**
 * @file 最小平移向量
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

define(function (require) {

    /**
     * 最小平移向量
     *
     * @constructor
     *
     * @param {Object} axis 轴对象
     * @param {number} 重叠大小
     */
    function MinTranslationVector(axis, overlap) {
        this.axis = axis;
        this.overlap = overlap;
    }

    return MinTranslationVector;
});
