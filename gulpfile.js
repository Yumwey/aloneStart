'use strict';

var  gulp = require('gulp');

var livereload = require('gulp-livereload'), 
    webserver = require('gulp-webserver'),
    sass = require('gulp-sass'),
    imagemin = require('gulp-imagemin'),
    changed = require('gulp-changed'),	// 只操作有过修改的文件
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    pngquant = require('pngquant'),
    clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var minifyHTML   = require('gulp-minify-html');



//基本设置

var baseDevConfig = {
    HTML: './view/**',
    CSS: './css',
    JS: './js/**',
    IMAGES: 'images/**',
    SASS: './sass'
}

var baseDistConfig = {
    HTML: 'dist/view',
    CSS: 'dist/css',
    IMAGES: 'dist/images',
    JS: 'dist/js'
}
//Sass 预处理
gulp.task('sass', function () {
    return gulp.src(baseDevConfig.SASS + '/*.scss')
      .pipe(sass.sync().on('error', sass.logError))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest('./css'))
  });
   

  //图片压缩
gulp.task('images', function(){
    return gulp.src( baseDevConfig.IMAGES ) // 指明源文件路径，如需匹配指定格式的文件，可以写成 .{png,jpg,gif,svg}
        .pipe(changed( baseDevConfig.IMAGES ))
        .pipe(imagemin({
            progressive: true, // 无损压缩JPG图片
            svgoPlugins: [{removeViewBox: false}], // 不要移除svg的viewbox属性
            use: [pngquant()] // 深度压缩PNG
        }))
        .pipe(gulp.dest( baseDistConfig.IMAGES )); // 输出路径
});

//js压缩
gulp.task('script', function() {
    return gulp.src( [baseDevConfig.JS +'/*.js','!'+ baseDevConfig.JS+'/*.min.js'] ) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
        .pipe(changed( baseDistConfig.JS )) // 对应匹配的文件
        .pipe(sourcemaps.init()) // 执行sourcemaps
        .pipe(rename({ suffix: '.min' })) // 重命名
        .pipe(uglify()) // 使用uglify进行压缩，并保留部分注释
        // .pipe(sourcemaps.write('./maps')) // 地图输出路径（存放位置）
        .pipe(gulp.dest( baseDistConfig.JS )); // 输出路径
});

// HTML监听
gulp.task('html', function() {
    return gulp.src( baseDevConfig.HTML+'/*.html' )
        .pipe(changed( baseDistConfig.HTML ))
        .pipe(gulp.dest( baseDistConfig.HTML));
});
//版本控制
gulp.task('revCss', function(){
    return gulp.src(['css/**/*.css'])
        .pipe(minifyCss())
        .pipe(rev())
        .pipe(gulp.dest('dist/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css')); 
})

gulp.task('revJs', function(){
    return gulp.src(['js/**/*.js'])
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('dist/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js')); 
})

gulp.task('revc', function () {
    return gulp.src([baseDevConfig.HTML,'rev/*.json'])
        .pipe( revCollector({
            replaceReved: true
        }) )
        .pipe(minifyHTML({
                empty:true,
                spare:true
            }) )
        .pipe(gulp.dest(baseDistConfig.HTML) );
});

// 启动页面服务

//pc调试服务
gulp.task('pcServer', function() {
    gulp.src('view/pc')
    .pipe(webserver({
        livereload: true,
        port: 3000,
        open: true // 启动浏览器
    }))
});

//手机调试服务
gulp.task('mobileServer', function() {
    // gulp.src('view/mobile')
    gulp.src('./')
    .pipe(webserver({
        livereload: true,
        port: 3000,
        open: true // 启动浏览器
    }))
});
//监听页面

gulp.task('watch', function() {
    gulp.watch('./view/**/*.html',['html','sass']);
    gulp.watch('./sass/**/*.scss', ['sass']);
});

// 回收
gulp.task('clean', function() {
    return gulp.src( './dist', {read: false} ) // 清理maps文件
        .pipe(clean());
});

// 版本生成 

gulp.task('dist',['clean','revCss','revJs','revc']);

//调用配置: 开发

gulp.task('dev',['mobileServer','watch']);