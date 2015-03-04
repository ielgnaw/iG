var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var batch = require('gulp-batch');
var rimraf = require('gulp-rimraf');

/**
 * 文件列表
 *
 * @type {Object}
 */
var config = {
    /**
     * concat 的文件列表
     * start 为开头，end 为结尾，concat 顺序如下：`start.js -> !(start|end).js -> end.js`
     * !(start|end).js 这里面的所有 js，均为相互独立的，所以顺序无所谓
     *
     * @type {Array}
     */
    jsFiles: [
        'src/start.js',
        'src/!(end).js',
        'src/end.js'
    ],

    /**
     * 清空的文件夹
     *
     * @type {Array}
     */
    clean: [
        './js',
        './dist'
    ]
};

gulp.task('clean', function () {
    gulp.src(config.clean, {read: false})
        .pipe(rimraf());
});

gulp.task('dev', ['clean'], function (cb) {
    gulp.src(config.jsFiles)
        .pipe(concat('ig.js'))
        .pipe(gulp.dest('./js'));
    cb();
});

gulp.task('watch', function () {
    gulp.watch(['src/*.js'], batch(function (e, cb) {
        gulp.start('dev');
        cb();
        // e.on('data', console.log).on('end', cb);
    }));
});

gulp.task('pub', ['clean'], function (cb) {
    gulp.src(config.jsFiles)
        .pipe(concat('ig.js'))
        .pipe(gulp.dest('./js'))
        .pipe(rename('ig.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});
