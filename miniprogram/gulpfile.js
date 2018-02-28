let gulp = require('gulp')
let less = require('gulp-less')
let rename = require('gulp-rename')
var sourcemaps = require('gulp-sourcemaps')
var LessAutoprefix = require('less-plugin-autoprefix');
var autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] });


let lessPath = './pages/**/*.less'

gulp.task('less', function () {
  return gulp.src(lessPath)
    .pipe(less({
      plugins: [autoprefix]
    }))
    .pipe(rename(function (path) {
      path.extname = '.wxss'
    }))
    .pipe(gulp.dest('./pages/'))
})

gulp.task('style', function () {
  gulp.watch(lessPath, ['less'])
})
