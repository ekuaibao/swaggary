function pad(val, len) {
  var s = val.toString();
  for (var i = len - s.length; i > 0; i--)
    s = '0' + s;
  return s;
}

function format(value, _format) {
  if (value === undefined || value === null)
    return value;
  if (!format)
    format = '{yyyy}-{mm}-{dd}';
  var date = value;
  if (typeof date == 'string' && /^[0-9]+$/.test(date))
    date = parseInt(date, 10);
  if (typeof date == 'number')
    date = new Date(date);
  return _format.replace(/\{[^\}]+\}/g, function(m) {
    switch (m) {
      case '{yy}':
        return pad(date.getYear(), 2);
      case '{yyyy}':
        return date.getFullYear();
      case '{mm}':
        return pad(date.getMonth() + 1, 2);
      case '{dd}':
        return pad(date.getDate(), 2);
      case '{w}':
        return weekdays[date.getDay()];
      case '{HH}':
        return pad(date.getHours(), 2);
      case '{MM}':
        return pad(date.getMinutes(), 2);
      case '{SS}':
        return pad(date.getSeconds(), 2);
      case '{MMM}':
        return pad(date.getMilliseconds(), 3);
    }
    return m;
  });
}

module.exports = {
  format: format
};
