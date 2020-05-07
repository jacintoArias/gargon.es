// Import gulp and load plugins
const gulp = require('gulp');

const autoprefixer = require('autoprefixer');
const babelify = require('babelify');
const browserify = require('browserify');
const browserSync = require('browser-sync');
const buffer = require('vinyl-buffer');
const child = require('child_process');
const cssnano = require('cssnano');
const del = require('del');
const imagemin = require('gulp-imagemin');
const log = require('fancy-log');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const sass = require('gulp-sass');
const sassTildeImporter = require('node-sass-tilde-importer');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

// Browsersync server config
const bs_siteRoot = '_site';
const bs_host = '127.0.0.1';
const bs_port = '4000';
const reload = browserSync.reload;

// Load config paths from project files:
const paths = require('./paths');

// #######################################################
// TASKS:

// Clean style files
gulp.task('cleanStyles', (done) => {
  del([
    `${paths.jekyllData}/style_manifest.json`,
    `${paths.jekyllAssets}/style-*.css*`,
  ]).then((paths) => {
    console.log('Clean: Cleaned style files:\n', paths.join('\n'));
  });

  done();
});

// Clean style-vendor files
gulp.task('cleanVendorStyles', (done) => {
  del([
    `${paths.jekyllData}/styleVendor_manifest.json`,
    `${paths.jekyllAssets}/styleVendor-*.css*`,
  ]).then((paths) => {
    console.log('Clean: Cleaned vendor style files:\n', paths.join('\n'));
  });

  done();
});

// Clean script files
gulp.task('cleanScripts', (done) => {
  del([
    `${paths.jekyllData}/app_manifest.json`,
    `${paths.jekyllAssets}/app-*.js*`,
  ]).then((paths) => {
    console.log('Clean: Cleaned script files:\n', paths.join('\n'));
  });

  done();
});

// -> CLEAN
gulp.task(
  'clean',
  gulp.parallel('cleanStyles', 'cleanVendorStyles', 'cleanScripts')
);

// -> STYLES
// Build customized bootstrap 4 and bundle with styles
gulp.task('styles', () => {
  return gulp
    .src(paths.appSassFiles)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'expanded',
        includePaths: [paths.appSassFiles],
        importer: sassTildeImporter,
      })
    )
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename('style.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(rev())
    .pipe(gulp.dest(paths.jekyllAssets))
    .pipe(rev.manifest())
    .pipe(rename({ basename: 'style_manifest' }))
    .pipe(gulp.dest(paths.jekyllData));
});

gulp.task('vendorStyles', () => {
  return gulp
    .src(paths.appSassVendorEntry)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'expanded',
        includePaths: [paths.appSassVendorEntry],
        importer: sassTildeImporter,
      })
    )
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename('styleVendor.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(rev())
    .pipe(gulp.dest(paths.jekyllAssets))
    .pipe(rev.manifest())
    .pipe(rename({ basename: 'styleVendor_manifest' }))
    .pipe(gulp.dest(paths.jekyllData));
});

// -> SCRIPTS
// Build and bundle vendor JavaScript
gulp.task('scripts', () => {
  return browserify({
    entries: paths.appScriptEntry,
    debug: true,
  })
    .transform('babelify', { presets: ['@babel/env'] })
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(rev())
    .pipe(gulp.dest(paths.jekyllAssets))
    .pipe(rev.manifest())
    .pipe(rename({ basename: 'app_manifest' }))
    .on('error', function (error) {
      // we have an error
      done(error);
    })
    .pipe(gulp.dest(paths.jekyllData));
});

// -> IMAGES
// Minify IMAGES
gulp.task('images', (done) => {
  return gulp.src(paths.appImages)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(paths.jekyllAssets))
});

// -> JEKYLL
// Spawn jekyll build
gulp.task('jekyll', () => {
  const distDir = process.env.DIST_DIR || 'dist';
  const destination = process.env.NODE_ENV === 'prod' ? distDir : bs_siteRoot;
  const configFiles =
    process.env.NODE_ENV === 'prod'
      ? paths.configFileProd
      : paths.configFileProd + ',' + paths.configFileDev;

  const jekyll = child.spawn('/bin/bash', [
    '-lc',
    `jekyll build -s ${paths.src} --config ${configFiles} --destination ${destination}`
  ]);

  const jekyllLogger = (buffer) => {
    buffer
      .toString()
      .split(/\n/)
      .forEach((message) => log('Jekyll: ' + message));
  };

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('error', jekyllLogger);

  return jekyll;
});


// -> SERVE
// Launch browsersync server and watch for changes
gulp.task('serve', () => {
  browserSync({
    open: false,
    host: bs_host,
    port: bs_port,
    server: {
      baseDir: bs_siteRoot,
    },
  });

  // Watch for jekyll files
  gulp.watch([`${paths.src}/**/*.*`], gulp.series(['jekyll', 'reload']));

  // Watch for styles
  gulp.watch([paths.appSassFiles], gulp.series(['cleanStyles', 'styles']));
  gulp.watch(
    [paths.appSassVendorFiles],
    gulp.series('cleanVendorStyles', 'vendorStyles')
  );

  // Watch for scripts
  gulp.watch([paths.appScriptFiles], gulp.series('cleanScripts', 'scripts'));

  // Watch for images
  gulp.watch([paths.appImages], gulp.series('images'));
});

// -> RELOAD
gulp.task('reload', (done) => {
  browserSync.reload();
  done();
});

// -> BUILD
gulp.task(
  'build',
  gulp.series(
    'clean',
    gulp.parallel('styles', 'vendorStyles', 'scripts', 'images'),
    'jekyll'
  )
);

// -> DEFAULT
gulp.task('default', gulp.series('build', 'serve'));
