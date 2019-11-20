const rollup = require('rollup');
const { parallel, src, dest } = require('gulp');
const uglify = require('gulp-uglify');
const uglifyES = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
// const del = require('del');

const path = require('path');
const source = "./src";
const target = "./dist";

const jsFiles = [
  path.join(source, 'js', 'index.js'),
  path.join(source, 'js', 'help.js')
];

const polyfill = "./node_modules/@babel/polyfill/dist/polyfill.min.js";

const cssFiles = path.join(source, 'css', '*.css');


function cssTask() {
  return src(cssFiles)
  .pipe(autoprefixer())
  .pipe(cleanCSS({
    compatibility: 'ie8'
  }))
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
  // place code for your default task here
  // eslint-disable-next-line no-console
  console.log(jsFiles);
  cb();
}

function bundle() {
  return rollup.rollup({
    input: './src/js/datatable.js',
  }).then(bundle => {
    return bundle.write({
      file: './dist/datatable.module.js',
      format: 'iife',
      name: 'DataTable',
      sourcemap: true
    });
  });
}


module.exports = {
  default: defaultTask,
  build: parallel(
    cssTask,
    copyPolyfill,
    jsTaskNoModule,
    jsTaskWithModule
  ),
  bundle: bundle
};


 
 