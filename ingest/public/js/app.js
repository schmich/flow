var app = angular.module('flow', []);

app.controller('ReportCtrl', function($scope, $http) {
  var inversionChart = c3.generate({
    bindto: '#inversion-chart',
    transition: {
      duration: 0
    },
    point: {
      show: false
    },
    data: {
      x: 'Time',
      columns: [
        ['Time'],
        ['Inversions']
      ]
    },
    axis: {
      x: {
        type: 'timeseries',
        localtime: true,
        tick: {
          format: d3.time.format('%X')
        }
      }
    }
  });

  var rateChart = c3.generate({
    bindto: '#rate-chart',
    transition: {
      duration: 0
    },
    point: {
      show: false
    },
    data: {
      x: 'Time',
      columns: [
        ['Time'],
        ['Inversion Rate']
      ]
    },
    axis: {
      x: {
        type: 'timeseries',
        localtime: true,
        tick: {
          format: d3.time.format('%X')
        }
      }
    }
  });

  function updateCharts() {
    $http.get('/inversions/1')
      .success(function(res) {
        var time = [];
        var inversions = [];
        var rate = [];

        var samples = res.samples;
        for (var i = 0; i < samples.length; ++i) {
          inversions.push(samples[i][0]);
          time.push(new Date(samples[i][1]));

          if (i > 2) {
            var deltaI = samples[i][0] - samples[i - 3][0];
            var deltaT = (samples[i][1] - samples[i - 3][1]) / 1000;
            var currentRate = deltaI / deltaT;
            rate.push(currentRate);
          }
        }

        time.unshift('Time');
        inversions.unshift('Inversions');
        rate.unshift('Inversion Rate');

        inversionChart.load({
          columns: [time, inversions]
        });

        rateChart.load({
          columns: [time, rate]
        });
      })
      .error(function(res) {
      });
  }

  updateCharts();
  setInterval(updateCharts, 1000);
});
