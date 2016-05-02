Local Request
=============

Generate superagent-compliant requests that can be used for mocking or wrapping APIs with in-process HTTP interfaces.

```
function configure() {
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

  return app.request;
}

var request = configure();

request.get('/things').query({hello: 'world'}).end(function(err, res) {
	assert.ok(!err);
	assert.equal(res.status, 200);
	assert.ok(res.ok);
	assert.deepEqual(res.body, [{id: 1, name: 'hello'}, {id: 2, name: 'world'}]);
	callback();
});
```