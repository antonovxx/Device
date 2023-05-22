import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import rename from 'gulp-rename';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import del from 'del';
import {stacksvg} from 'gulp-stacksvg';

//HTML

const html = () => {
  return gulp
    .src('source/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
};

// Styles

export const styles = () => {
  return gulp
    .src('source/sass/style.scss', {sourcemaps: true})
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), csso()]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', {sourcemaps: '.'}))
    .pipe(browser.stream());
};

// Scripts

const scripts = () => {
  return gulp
    .src('source/js/*.js')
    .pipe(terser())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
};

//Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}').pipe(squoosh()).pipe(gulp.dest('build/img'));
};

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}').pipe(gulp.dest('build/img'));
};

//WebP

const createWebp = () => {
  return gulp
    .src('source/img/**/*.jpg')
    .pipe(
      squoosh({
        webp: {},
      }),
    )
    .pipe(gulp.dest('build/img'));
};

//SVG

const svg = () => {
  return gulp.src('source/img/**/*.svg').pipe(svgo()).pipe(gulp.dest('build/img'));
};

const sprite = () => {
  return gulp.src('source/img/svg/*.svg').pipe(stacksvg()).pipe(gulp.dest('build/img'));
};

// Copy

const copy = (done) => {
  gulp
    .src(['source/fonts/*.{woff2,woff}'], {
      base: 'source',
    })
    .pipe(gulp.dest('build'));
  done();
};

// Clean

const clean = () => {
  return del('build');
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build',
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

// Reload

const reload = (done) => {
  browser.reload();
  done();
};

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
};

// Build

export const build = gulp.series(clean, copy, optimizeImages, styles, html, scripts, svg, sprite, createWebp);

// Default

export default gulp.series(clean, copy, copyImages, styles, html, scripts, svg, sprite, createWebp, gulp.series(server, watcher));
