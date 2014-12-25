var gpio = require('pi-gpio');
var async = require('async');
var request = require('request');

var $config = {
  ingestionServer: 'http://192.168.2.77:8888',
  dataPin: 11,
};

var lastLevel = 0;
var inversions = 0;

var inversionBuffer = [];

console.log('Flow monitor service running.');

gpio.close($config.dataPin, function() {
  gpio.open($config.dataPin, 'input', function(err) {
    async.forever(
      function(next) {
        gpio.read($config.dataPin, function(err, currentLevel) {
          if (err) {
            next(err);
            return;
          }

          if (currentLevel != lastLevel) {
            ++inversions;
            lastLevel = currentLevel;
          }

          next();
        });
      },
      function(err) {
        console.log('Error: ' + err);
      }
    );
  });
});

setInterval(function() {
  console.log('Inversions: ' + inversions);
}, 2000);

setInterval(function() {
  var timestamp = (new Date()).getTime();
  inversionBuffer.push([inversions, timestamp]);
}, 1000);

setInterval(function() {
  var payload = inversionBuffer.slice(0);
  inversionBuffer = [];

  console.log('Sending ' + payload.length + ' inversions.');

  request.post({ url: $config.ingestionServer + '/inversions', json: true, body: payload }, function(err, resp, body) {
    console.log('Response: ' + resp.statusCode);
  });
}, 1000);
