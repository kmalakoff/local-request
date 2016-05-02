var URL = require('url');
var RouteRecognizer  = require('route-recognizer');
var assign = require('lodash.assign');
var defer = require('lodash.defer');

var Request = require('./server/request');
var Response = require('./server/response');
var request = require('./client/factory');

var METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'];
var METHODS_ALL = ['ALL'].concat(METHODS);

var LocalRequest = module.exports = function() {
  var _this = this;

  this.METHODS = METHODS;
  this.routers = {};
  METHODS_ALL.forEach(function(method) { _this.routers[method] = new RouteRecognizer(); });
  this.request = request(this);
}

METHODS_ALL.forEach(function(method) {
  var name = method.toLowerCase(); if (name === 'delete') name = 'del';
  LocalRequest.prototype[name] = function(path, handler) {
    this.routers[method].add([{path: path, handler: handler}]);
  }
});

LocalRequest.prototype.send = function(data, callback) {
  var _this = this;

  // send later
  defer(function() {
    var parts = URL.parse(data.url, true);
    if (LocalRequest.debug) console.log('Request ' + parts.pathname, parts.query);

    var res = new Response(function(data) {
      if (LocalRequest.debug) console.log('Response ' + parts.pathname, data.status, data.body);

      callback(null, data);
    });

    var results = _this.routers[data.method].recognize(parts.pathname); // try method
    if (!results || !results.length) results = _this.routers.ALL.recognize(parts.pathname); // try all
    if (!results || !results.length) return res.status(404).send({_message: 'Handler missing for ' + parts.pathname}); // no handler matches

    var req = new Request(assign({}, data, {url: parts.pathname, params: results[0].params, query: parts.query}));
    results[0].handler(req, res);
  })
}
