var gulp = require('gulp'),
    watch = require('gulp-watch'),
    gutil = require("gulp-util"),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins(),
    browserSync = require('browser-sync'),
    pngquant = require('imagemin-pngquant'),
    webpack = require('webpack'),
    webpackStream = require('webpack-stream'),
    webpackConfig = require('./webpack.config'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    webpackHotMiddleware = require('webpack-hot-middleware');

var revCollector = require('gulp-rev-collector');


//use webpack to manage all the resources in src/
gulp.task('webpack', function (done) {
    gulp.src('./src/index.html').pipe(gulp.dest('./build'));
    //return gulp.src('./src/index.js')
    //  .pipe(webpackStream(webpackConfig, webpack))
    //  .pipe(gulp.dest('./build/assets/'));

    var myConfig = Object.create(webpackConfig);
    webpack(myConfig, function (err, stats) {
        if (err) throw new gutil.PluginError("webpack:dist", err);
        gutil.log("[webpack:dist]", stats.toString({
            colors: true
        }));
        done();
    });
});

//process all the js file in build/ (using minify/uglify)
gulp.task('js', ['webpack'], function () {
    return gulp.src('./build/assets/js/*.js')
        .pipe(plugins.jshint())
        .pipe(plugins.uglify())
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/assets/js'))
        .pipe(plugins.rev.manifest('dist/assets/rev-manifest.json', {
            base: process.cwd() + '/dist/assets',
            merge: true
        }))
        .pipe(gulp.dest('dist/assets'));
});

//process all the css file in build/
gulp.task('css', ['webpack', 'img'], function () {
    var mapFile = gulp.src("./dist/assets/rev-manifest.json");
    return gulp.src('./build/assets/css/*.css')
        .pipe(plugins.minifyCss())
        //.pipe(plugins.revReplace({manifest: mapFile}))
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/assets/css'))
        .pipe(plugins.rev.manifest('dist/assets/rev-manifest.json', {
            base: process.cwd() + '/dist/assets',
            merge: true
        }))
        .pipe(gulp.dest('dist/assets'));
});

gulp.task('img', ['webpack'], function () {
    return gulp.src('./build/assets/img/*.*')
        .pipe(plugins.imagemin({
            progressive: true,
            use: [pngquant({quality: '70-80'})]
        }))
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/assets/img'))
        .pipe(plugins.rev.manifest('dist/assets/rev-manifest.json', {
            base: process.cwd() + '/dist/assets',
            merge: true
        }))
        .pipe(gulp.dest('dist/assets'));
});

gulp.task('server', function () {
    browserSync({
        server: {
            baseDir: './build'
        }
    });
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.*', ['webpack']);
});

// gulp.task('hot', function() {
//   var bundler = webpack(webpackConfig);
//   browserSync({
//     proxy: {
//       target: 'localhost:3000',
//       middleware: [
//         webpackDevMiddleware(bundler, {
//           publicPath: webpackConfig.output.publicPath,
//           // stats: webpackConfig.stats,
//           hot: true,
//           historyApiFallback: true
//         }),
//         webpackHotMiddleware(bundler),
//       ]
//     },
//     files: [
//       'src/*.*',
//       'src/templates/*.*',
//       'src/components/**/*.*',
//       'src/css/**/*.*',
//       'src/js/**/*.*'
//     ]
//   });
// });

gulp.task('clean', function () {
    return gulp.src(['dist/*', 'build/*'], {read: false})
        .pipe(plugins.clean());
});


gulp.task('replace', ['css', 'js', 'img'], function () {
    var mapFile = gulp.src("./dist/assets/rev-manifest.json");
    return gulp.src('./build/index.html')
        .pipe(plugins.revReplace({manifest: mapFile}))
        .pipe(gulp.dest('dist'));
});

gulp.task('replace-cdn', ['css', 'js', 'img'], function() {
    gulp.src(['./dist/assets/*.json', './build/*.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                'assets/css/': '/dist/css/',
                //'assets/js/': '/dist/js/',
                'assets/js/': function (manifest_value) {
                    return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'example.dot' + '/img/' + manifest_value;
                }
            }
        }))
        .pipe(gulp.dest('./dist'));                     //- 替换后的文件输出的目录
});


gulp.task('dist', ['clean'], function () {
    gulp.start('webpack', 'img', 'js', 'css', 'replace');
});


gulp.task('dist-cdn', ['clean'], function () {
    gulp.start('webpack', 'img', 'js', 'css', 'replace-cdn');
});



gulp.task('help', function () {
    console.log('---------------------------------------------------------------');
    console.log('gulp [command]  --- with gulp installed globally');
    console.log('Command List:');
    console.log('  webpack  #use webpack to pack all files src/ ---> build/');
    console.log('  js       #dist all js files /build ---> dist/ ');
    console.log('  css      #dist all css files /build ---> dist/');
    console.log('  img       #dist all picture files /build ---> dist/ ');
    console.log('  dist    #do all the works');
    console.log('  clean    #clear directories such as build/ & dist/');
    console.log('---------------------------------------------------------------');
});
