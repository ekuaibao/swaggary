'use strict'

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

function config(opts) {
  return {
    devtool: 'cheap-module-source-map',
    module: {
      loaders: [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-0', 'stage-2']
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
    babel: {
      plugins: [
        ['antd', {
          style: 'css'
        }]
      ]
    },
    postcss: postcss,
    // https://facebook.github.io/react/downloads.html#npm
    // http://stackoverflow.com/questions/29096018/react-webpack-process-env-is-undefined
    plugins: [
      new HtmlWebpackPlugin({
        title: opts.title || ''
      })
    ],
    resolve: {
      extensions: ['', '.js', '.jsx']
    }
  }
}

function postcss() {
  let imp = require('postcss-import')
  let nested = require('postcss-nested')
  let mixins = require('postcss-mixins')
  let autoprefixer = require('autoprefixer')
  let svgo = require('postcss-svgo')
  let csso = require('postcss-csso')
  return [imp, nested, mixins, autoprefixer, svgo, csso]
}

module.exports = config
