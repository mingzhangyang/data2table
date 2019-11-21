const rollup = require('rollup');
const { parallel, series, src, dest } = require('gulp');
const uglify = require('gulp-uglify');
const uglifyES = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const del = require('del');

const path = require('path');

// It is recommended to use absolute path to avoid copying directory to dist
const target = path.join(__dirname, 'dist');
const jsFiles = path.join(__dirname, 'src', 'datatable.bundle.js');
const polyfill = path.join(__dirname, "node_modules", "@babel/polyfill/dist/polyfill.min.js");
const cssFiles = path.join(__dirname, 'src', 'css', '*.css');

function cleanDist() {
  return del([
    'dist/**/*',
  ]);
}


function cssTask() {
  return src(cssFiles)
  .pipe(autoprefixer())
  .pipe(cleanCSS({
    compatibility: 'ie8'
  }))
  .pipe(concat('datatable.bundle.css'))
  .pipe(dest(target));
}

function copyPolyfill() {
  return src(polyfill)
  .pipe(dest(target));
}


function jsTaskWithModule() {
  return src(jsFiles)
  .pipe(uglifyES())
  .pipe(dest(target));
}

function jsTaskNoModule() {
  return src(jsFiles)
  .pipe(babel({
    presets: ['@babel/env'],
    plugins: ["syntax-async-functions"]
  }))
  .pipe(uglify())
  .pipe(rename({
    suffix: '.fallback'
  }))
  .pipe(dest(target));
}

function defaultTask(cb) {
  console.log(jsFiles);
  cb();
}

function cleanTmp() {
  return del([
    './src/datatable.bundle.js',
  ]);
}

function bundle() {
  return rollup.rollup({
    input: './src/js/datatable.js',
  }).then(bundle => {
    return bundle.write({
      file: './src/datatable.bundle.js',
      format: 'iife',
      name: 'DataTable',
    });
  });
}


module.exports = {
  default: defaultTask,
  build: series(
    cleanDist,
    parallel(
      cssTask,
      copyPolyfill,
      series(
        bundle,
        parallel(
          jsTaskNoModule,
          jsTaskWithModule
        ),
        cleanTmp,
      ),
    ),
  ),
  clean: cleanDist,
  css: cssTask,
  "js-no-module": series(bundle, jsTaskNoModule),
  "js-module": series(bundle, jsTaskWithModule),
  cleanTmp: cleanTmp,
};


 
 