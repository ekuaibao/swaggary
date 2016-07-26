'use strict'

const path = require('path')
const config = require('./buildscript/webpack.config.js')

module.exports = Object.assign({}, config, {
  entry: {
    './index.js': path.resolve(__dirname, 'src/index.js')
  },
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'build')
  }
})