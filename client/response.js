var assign = require('lodash.assign');
var isUndefined = require('lodash.isundefined');

var Response = module.exports = function(data) {
  assign(this, {headers: data.headers || {}, status: data.status});
  if (!isUndefined(data.body)) this.body = data.body;

  var type = data.status / 100 | 0;
  this.ok = (type == 2);
}
