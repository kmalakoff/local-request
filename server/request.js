var Request = module.exports = function(data) {
  this.url = data.url;
  this.method = data.method;
  this.params = data.params;
  this.headers = data.headers || {};
  this.query = data.query || {};
  this.body = data.body;
}
