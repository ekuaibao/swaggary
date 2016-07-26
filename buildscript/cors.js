function cors(opts) {
  var pattern = opts && opts.pattern || opts;
  var methods = opts && opts.methods || 'GET, POST, OPTIONS';
  return function (req, resp, next) {
    if ((!pattern || pattern.test(req.url)) && req.method == 'OPTIONS') {
      resp.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': methods,
        'Access-Control-Allow-Headers': 'authorization'
      });
      resp.end();
    } else {
      next();
    }
  };
}

module.exports = cors;