var basePaths = {
	src: '/',
	dest: ''
};

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('lint', function () {
  gulp.src('./**/*.js')
    .pipe(plugins.jshint());
});

gulp.task('develop', function () {
  plugins.nodemon({ script: 'index.js'
          , ext: 'js'
          , ignore: []
          //, tasks: ['lint'] })
          , tasks: [] })
    .on('restart', function () {
    	console.log('BOT RESTARTED!');
    })
});

var notifyMe = function(){
	gulp.src('*.js').pipe(plugins.notify("Change Detected in <%= file.relative %>. Restarting bot!"));
}

gulp.task('default', ['develop']); 