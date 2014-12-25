var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

var $config = {
  mongo: 'mongodb://192.168.2.77/flow',
  port: 8888
};

var app = express();

app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.json());

MongoClient.connect($config.mongo, function(err, db) {
  var inversionCollection = db.collection('inversions');

  app.get('/', function(req, res) {
    res.render('index');
  });

  app.post('/inversions', function(req, res) {
    console.log(req.body);
    res.send({ success: true });

    var find = { id: 1 };
    var update = { $push: { samples: { $each: req.body } } };
    inversionCollection.update(find, update, function() {
      console.log(req.body.length + ' inversion samples saved.');
    });
  });

  app.get('/inversions/:id', function(req, res) {
    var find = { id: parseInt(req.params.id) };
    var project = {
      _id: 0,
      id: 0,
      samples: { $slice: -60 }
    };
    inversionCollection.findOne(find, project, function(err, doc) {
      res.send(doc);
    });
  });

  app.listen($config.port, function() {
    console.log('Listening on port ' + $config.port + '...');
  });
});
