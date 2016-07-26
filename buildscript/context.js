module.exports = function(context) {
  if (context[0] != '/')
    context = '/' + context;
  if (context[context.length - 1] != '/')
    context = context + '/';
  return function(req, resp, next) {
    if (req.url.startsWith(context)) {
      req.url = req.url.slice(context.length - 1);
      next();
    } else {
      resp.status(404).send('Not found');
    }
  };
}
