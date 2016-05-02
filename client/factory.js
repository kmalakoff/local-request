var Request = require('./request');
var Response = require('./response');
var inherits = require('inherits');

module.exports = function(app) {
  var request = {Response: Response};
  request.Request = function() { Request.apply(this, Array.prototype.slice.call(arguments, 0).concat([app])); };
  inherits(request.Request, Request);

  app.METHODS.forEach(function(method) {
    var name = method.toLowerCase(); if (name === 'delete') name = 'del';
    request[name] = function(url) {
      if (arguments.length !== 1) throw new Error('local-request only supports request(url).end(function(err, res) {}) format');
      return new request.Request(method, url);
    };
  });

  return request;
}
