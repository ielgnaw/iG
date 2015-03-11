var gulp = require('gulp');
var batch = require('gulp-batch');

gulp.task('watch', function () {
    gulp.watch(['src/**/*.js', 'tool/**/*.js', 'gulpfile.js'], batch(function (e, cb) {
        // gulp.start('dev');
        // cb();
        // e.on('data', console.log).on('end', cb);

        var spawn = require('child_process').spawn;
        var node = spawn('node', ['tool/index.js']);
        node.stdout.on('data', function (data) {
            console.log('stdout: ' + data); // 命令执行结果
        });

        node.stderr.on('data', function (data) {
            console.log('stderr: ' + data); // 输出错误数据
        });

        node.on('exit', function (code) {
            console.log('child process exited with code ' + code); // 退出命令
        });

        cb();
    }));
});
