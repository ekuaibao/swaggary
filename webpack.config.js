'use strict'

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')


const config = {
  entry: {
    './index.js': path.resolve(__dirname, 'src/index.js')
  },
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'react']
      }
    }, {
      test: /\.style\.css$/,
      exclude: /node_modules/,
      loader: 'style!css?camelCase&modules&localIdentName=[local]-[hash:base64:5]!postcss'
    }, {
      test: /\.css$/,
      exclude: /node_modules|\.style\.css/,
      loader: 'style!css!postcss'
    }, {
      test: /\.css$/,
      include: /node_modules/,
      loader: 'style!css'
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'swaggary'
    }),
    new webpack.DefinePlugin({
      '$swagger_document_url': JSON.stringify('/doc/apidocs/generated/service.json')
    })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  devServer: {
    proxy: {
      '/doc/*': {
        target: 'http://localhost:1338'
      }
    }
  },
  postcss() {
    let imp = require('postcss-import')
    let nested = require('postcss-nested')
    let mixins = require('postcss-mixins')
    let autoprefixer = require('autoprefixer')
    let svgo = require('postcss-svgo')
    let csso = require('postcss-csso')
    return [imp, nested, mixins, autoprefixer, svgo, csso]
  }
}

module.exports = config