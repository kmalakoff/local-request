var URL = require('url');
var EventEmitter = require('component-emitter');
var Response = require('./response');

var Request = module.exports = function(method, url, app) {
  this.method = method;
  this.url = url;
  this.app = app;
  this.headers = {};
  this.queries = [];
}
EventEmitter(Request.prototype); // extends

Request.prototype.send = function(data) {
  this.data = data;
  return this;
}

Request.prototype.query = function(queryOrkey, value) {
  if (arguments.length === 2) { var query = {}; query[queryOrkey] = value; queryOrkey = query; }
  this.queries.push(queryOrkey);
  return this;
}

Request.prototype.abort = function() {
  if (this.aborted) return;
  this.aborted = true;
  this.emit('abort');
  return this;
}

Request.prototype._serializeQueries = function() {
  var queries = [];
  this.queries.forEach(function(query) {
    var value;
    for (var key in query) {
      value = query[key];
      if (value === null) value = '';
      queries.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
  });
  return queries.join('&');
}

Request.prototype.end = function(callback) {
  var _this = this;
  if (this.aborted) return;

  var url = this.url;
  var query = this._serializeQueries();
  if (query.length) {
    var parts = URL.parse(this.url);
    if (parts.search && parts.search.length) parts.search += '&' + query;
    else parts.search = '?' + query;
    url = URL.format(parts);
  }

  var data = {url: url, method: this.method, headers: this.headers};
  if (this.data) data.body = this.data;

  this.app.send(data, function(err, res) {
    _this.aborted || callback(err, new Response(res));
  });
  return this;
}
