const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer({
  ws: true
})

proxy.on('error', err => {
  console.log('http proxy error: %s', err.message)
})

function urlCheckFn(pattern, exclude) {
  return url => pattern.test(url) && (!exclude || !exclude.test(url))
}

function createProxy(server, opts) {
  const shouldProxy = urlCheckFn(opts.pattern, opts.exclude)
  const proxyOpts = {
    target: opts.target
  }
  if (opts.hostHeader) {
    proxy.on('proxyReq', (proxyReq, req, res, options) => {
      proxyReq.setHeader('Host', opts.hostHeader)
    })
  }
  server.on('upgrade', (req, socket, head) => {
    if (shouldProxy(req.url)) {
      proxy.ws(req, socket, head, proxyOpts)
    }
  })
  return (req, resp, next) => {
    if (shouldProxy(req.url)) {
      proxy.web(req, resp, proxyOpts);
    } else {
      next();
    }
  };
};

module.exports = createProxy;
