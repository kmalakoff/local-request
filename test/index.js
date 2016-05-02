var assert = require('chai').assert;
var LocalRequest = require('..');

function setup() {
  var app = new LocalRequest();

  app.get('/things', function(req, res) {
    res.json([{id: 1, name: 'hello'}, {id: 2, name: 'world'}]);
  });

  app.get('/things/:id', function(req, res) {
    res.json({id: +req.params.id, query: req.query});
  });

  app.put('/things/:id', function(req, res) {
    res.json({id: +req.params.id, body: req.body});
  });

  app.post('/things', function(req, res) {
    res.json({id: 3, body: req.body});
  });

  app.del('/things/:id', function(req, res) {
    res.status(200).send();
  });

  app.get('/null', function(req, res) {
    res.json(null);
  });

  app.all('/errors/:code', function(req, res) {
    res.status(+req.params.code).send();
  });

  return app;
}

describe("Application", function() {
  var app, request;

  beforeEach(function(callback) { app = setup(); request = app.request; callback(); });

  describe("Success cases", function() {

    it("should succeed with get", function(callback) {
      request.get('/things').query({hello: 'world'}).end(function(err, res) {
        assert.ok(!err);
        assert.equal(res.status, 200);
        assert.ok(res.ok);
        assert.deepEqual(res.body, [{id: 1, name: 'hello'}, {id: 2, name: 'world'}]);
        callback();
      });
    });

    it("should succeed with get with parameter and query", function(callback) {
      request.get('/things/1').query({hello: 'world'}).end(function(err, res) {
        assert.ok(!err);
        assert.equal(res.status, 200);
        assert.ok(res.ok);
        assert.deepEqual(res.body, {id: 1, query: {hello: 'world'}});
        callback();
      });
    });

    it("should succeed with put", function(callback) {
      request.put('/things/2').send({hello: 'world'}).end(function(err, res) {
        assert.ok(!err);
        assert.equal(res.status, 200);
        assert.ok(res.ok);
        assert.deepEqual(res.body, {id: 2, body: {hello: 'world'}});
        callback();
      });
    });

    it("should succeed with post", function(callback) {
      request.post('/things').send({hello: 'world'}).end(function(err, res) {
        assert.ok(!err);
        assert.equal(res.status, 200);
        assert.ok(res.ok);
        assert.deepEqual(res.body, {id: 3, body: {hello: 'world'}});
        callback();
      });
    });

    it("should succeed with delete", function(callback) {
      request.del('/things/2').end(function(err, res) {
        assert.ok(!err);
        assert.equal(res.status, 200);
        assert.ok(res.ok);
        assert.ok(!res.body);
        callback();
      });
    });

    it("should get null", function(callback) {
      request.get('/null').end(function(err, res) {
        assert.ok(!err);
        assert.equal(res.status, 200);
        assert.ok(res.ok);
        assert.equal(res.body, null);
        callback();
      });
    });
  });

  describe("Failure cases", function() {
    it("should fail with unrecognized get", function(callback) {
      request.get('/nothings/2').end(function(err, res) {
        assert.ok(!err);
        assert.equal(res.status, 404);
        assert.ok(!res.ok);
        callback();
      });
    });

    it("should fail with unrecognized post", function(callback) {
      request.post('/nothings').end(function(err, res) {
        assert.ok(!err);
        assert.equal(res.status, 404);
        assert.ok(!res.ok);
        callback();
      });
    });

    it("should fail with unrecognized put", function(callback) {
      request.put('/nothings/1929').end(function(err, res) {
        assert.ok(!err);
        assert.equal(res.status, 404);
        assert.ok(!res.ok);
        callback();
      });
    });

    it("should fail with unrecognized delete", function(callback) {
      request.del('/nothings/1929').end(function(err, res) {
        assert.ok(!err);
        assert.equal(res.status, 404);
        assert.ok(!res.ok);
        callback();
      });
    });

    it("should fail with error code", function(callback) {
      request.del('/errors/500').end(function(err, res) {
        assert.ok(!err);
        assert.equal(res.status, 500);
        assert.ok(!res.ok);
        callback();
      });
    });
  });

  describe("Abort", function() {
    it("should abort without calling end", function(callback) {
      var abortWasCalled = false;
      var callbackWasCalled = false;

      var req = request.get('/nothings/2').end(function(err, res) { callbackWasCalled = true; });
      req.on('abort', function() { abortWasCalled = true; })
      req.abort();

      setTimeout(function() {
        assert.equal(abortWasCalled, true);
        assert.equal(callbackWasCalled, false);
        callback();
      }, 50);
    });
  });
});
