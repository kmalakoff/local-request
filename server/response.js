var isUndefined = require('lodash.isundefined');
var isString = require('lodash.isstring');
var pick = require('lodash.pick');

var Response = module.exports = function(callback) {
  this.callback = callback;
  this.data = {headers: {}, status: 200};
}

Response.prototype.json = function(json) {
  this.send(json);
}

Response.prototype.status = function(status) {
  this.data.status = status; return this;
}

Response.prototype.sendError = function(err) {
  var data = {};
  if (isString(err)) data.message = err;
  else data = pick(err, 'message', 'code');
  this.send(data);
}

Response.prototype.send = function(data) {
  if (this.wasSent) throw new Error('Response being sent multiple times');
  this.wasSent = true;

  if (!isUndefined(data)) this.data.body = data;
  this.callback(this.data);
}
