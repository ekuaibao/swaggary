var postcss = require('postcss');
var imp = require('postcss-import');
var nested = require('postcss-nested');
var mixins = require('postcss-mixins');
var svgo = require('postcss-svgo');
var csso = require('postcss-csso');

function refactCss(source, opts) {
  var worker = postcss()
    .use(imp())
    .use(mixins())
    .use(nested())
    .use(svgo())
  if (opts && opts.compress) {
    worker = worker.use(csso)
  }
  return worker
    .process(source)
    .then(function(result) {
      result.warnings().forEach(function(warn) {
        console.warn(warn.toString());
      });
      return result.css;
    });
}

module.exports = refactCss;
