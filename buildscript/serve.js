'use strict'

require('buffer')
const fs = require('fs')
const path = require('path')
const util = require('util')
const webpack = require('webpack')
const date = require('./date.js')
const argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command('quick', 'start dev server via select a subproject')
  .command('http', 'start dev server', {
    api: {
      alias: 'a',
      default: 'http://localhost:1338',
      describe: 'specify backend server url'
    },
    pattern: {
      alias: 'p',
      default: '^/api/',
      describe: 'specify which url should be redirect to backend server'
    },
    host: {
      describe: 'specify HOST header which will send to backend server'
    },
  })
  .command('build', 'build project with webpack')
  .example('$0 http --api=http://www.ekuaibao.com --pattern=^/api/ --host=www.ekuaibao.com', 'start dev server which proxy /api/* to http://www.ekuaibao.com with a fake HOST header www.ekuaibao.com')
  .help('h')
  .alias('h', 'help')
  .argv

function getWebpackConfig(path) {
  const config = require(path)
  config.plugins.push(new webpack.DefinePlugin({
    version: argv.ver ? '"' + argv.ver + '"' : date.format(new Date(), '"{yyyy}-{mm}-{dd} {HH}:{MM}"')
  }))
  const env = process.env.NODE_ENV
  config.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env)
  }))
  if (env === 'production') { // export NODE_ENV=production
    config.devtool = false
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true,
        warnings: false
      }
    }))
  }
  return config
}

const commands = {}

function addCommand(name, fn) {
  commands[name] = () => {
    try {
      return fn()
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

function log() {
  const args = Array.prototype.slice.call(arguments, 0)
  let msg = util.format.apply(util, args)
  msg = util.format('[%s] %s', date.format(new Date(), '{HH}:{MM}:{SS}.{MMM}'), msg)
  console.log(msg)
}

function runSeq() {
  return Array.prototype.slice.call(arguments, 0)
              .reduce((p, name) => p.then(() => runCommand(name)), Promise.resolve())
              .catch(errorHandler)
}

function runCommand(name) {
  const run = commands[name]
  if (run) {
    log('command %s start', name)
    return run().then(() => {
      log('command %s finish successfully', name)
    }, err => {
      const ex = new Error(util.format('command %s interrupt with expection', name))
      ex.cause = err
      throw ex
    })
  } else {
    const err = new Error(util.format('unknown command %s', name))
    return Promise.reject(err)
  }
}

function errorHandler(err) {
  if (err) {
    log(err.message)
    err = err.cause || err
    log(err.stack || err.message)
  } else {
    log('unknown error')
  }
}

(() => {
  const command = argv._[0]
  if (command) {
    process.nextTick(() =>
      runCommand(command).catch(errorHandler)
    )
  } else {
    console.log('command required')
  }
})()

addCommand('rebuild', () => {
  return runSeq('clean', 'build')
})

addCommand('clean', () => {
  let del = require('del')
  return del(['build'])
})

addCommand('build', () => {
  const p = path.resolve(process.cwd(), 'webpack.config.js')
  return doWebpack(getWebpackConfig(p))
})

addCommand('http', () => {
  return http(process.cwd())
})

function doWebpack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function http(dir) {
  return createDevServer({
    host: argv.host || '0.0.0.0',
    port: argv.port || 8088,
    context: argv.context,
    proxy: {
      hostHeader: argv.hostHeader,
      pattern: new RegExp(argv.pattern),
      target: argv.api
    },
    root: dir
  })
}

function createDevServer(opts) {
  const cors = require('./cors.js')
  const proxy = require('./proxy.js')
  const context = require('./context.js')
  const connect = require('connect')
  const webpackDevMiddleware = require("webpack-dev-middleware")
  const webpackHotMiddleware = require("webpack-hot-middleware")
  const http = require('http')
  const app = connect()
  const server = http.createServer(app)
  if (opts.proxy) {
    app.use(cors())
    app.use(proxy(server, opts.proxy))
    log('proxy api to: %s', opts.proxy.target)
  }
  var contextPath = opts.context
  if (contextPath) {
    if (contextPath[0] != '/')
      contextPath = '/' + contextPath
    if (contextPath[contextPath.length - 1] != '/')
      contextPath = contextPath + '/'
  }
  if (contextPath) {
    app.use(context(contextPath))
  }
  var config = getWebpackConfig(path.resolve(opts.root, 'webpack.config.js'))

  // add HMR plugin
  config.plugins.push(new webpack.HotModuleReplacementPlugin())

  // add HMR client
  Object.keys(config.entry).forEach(key => {
    var arr = config.entry[key]
    if (!Array.isArray(arr)) {
      config.entry[key] = arr = [arr]
    }
    arr.unshift('webpack-hot-middleware/client')
  })

  const compiler = webpack(config)
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    stats: {
      colors: true
    },
    publicPath: contextPath || ''
  }))
  app.use(webpackHotMiddleware(compiler))
  return new Promise((resolve, reject) => {
    server.listen(opts.port, opts.host, err => {
      if (err) {
        reject(err)
      } else {
        log('listening on %s:%d', opts.host, opts.port)
      }
    })
    process.once('SIGUSR2', () => {
      server.close(resolve)
    })
  })
}

addCommand('quick', () => {
  return quickStart()
})

function quickStart() {
  const root = path.resolve(path.dirname(__dirname), 'src')
  return getProjectConfigFiles(root)
    .then(arr => {
      arr = arr.map(p => p.slice(root.length + 1, -projectConfigFile.length - 1))
      const select = require('./select')({
        pointer: ' ▸ ',
        pointerColor: 'green',
        options: arr
      })
      return select.run()
    })
    .then(prj => {
      return http(path.resolve(root, prj))
    })
}

function fsCall(method) {
  const args = Array.prototype.slice.call(arguments, 1)
  return new Promise((resolve, reject) => {
    args.push((err, arr) => err ? reject(err) : resolve(arr))
    fs[method].apply(fs, args)
  })
}

const fsReaddir = p => fsCall('readdir', p)
const fsStat = p => fsCall('stat', p)
const projectConfigFile = 'webpack.config.js'

function getProjectConfigFiles(root) {
  return fsStat(root).then(s => {
    if (s.isDirectory()) {
      return fsReaddir(root).then(files =>
        Promise.all(files.map(sub => getProjectConfigFiles(path.join(root, sub))))
      ).then(arr => arr.reduce((a, b) => a.concat(b), []))
    } else if (path.basename(root) == projectConfigFile) {
      return [root]
    } else {
      return []
    }
  })
}
