'use strict'

const path = require('path')
const webpack = require('webpack')
const common = require('./buildscript/webpack.config.js')({
  title: 'swaggary'
})

const config = Object.assign({}, common, {
  entry: {
    './index.js': path.resolve(__dirname, 'src/index.js')
  },
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'dist')
  }
})

config.plugins.push(new webpack.DefinePlugin({
  '$swagger_document_url': JSON.stringify('/doc/apidocs/generated/service.json')
}))

module.exports = config