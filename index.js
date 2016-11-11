'user strict';

var events = require('events');
var request = require('request');
var WS = require('ws');

var MAX_WAITING_TIME = 30000;

module.exports = function (token, connectionError, slackError, wsError) {
  var waitingTime = 0;
  var ws;
  var destroyed = false;
  var pingIntervalId = null;
  var lastPong = 0;

  function destroy () {
    destroyed = true;

    clearInterval(pingIntervalId);

    if (ws) {
      ws.removeAllListeners();
      ws.terminate();
    }
  };

  function reconnect(abort) {
    if (abort !== undefined) return destroy();
    connect();
  };

  function connect () {
    clearInterval(pingIntervalId);
    if (destroyed) return;

    waitingTime = Math.min(waitingTime * 2 + 100, MAX_WAITING_TIME);
    setTimeout(doconnect, waitingTime);

    function doconnect () {
      request.post('https://slack.com/api/rtm.start', {
        json: true,
        qs: {
          token: token
        }
      }, function (err, res) {
        if (destroyed) return;

        if (err || res.statusCode >= 400) return connectionError(err || new Error(JSON.stringify(res.body)), reconnect);

        if (!res.body.ok) return slackError(new Error(res.body.error), reconnect);

        var ws = new WS(res.body.url, {
          agent: null
        });

        ws.on('open', function () {
          lastPong = 0;
          waitingTime = 0;

          pingIntervalId = setInterval(function () {
            if (lastPong && lastPong + 12000 < Date.now()) {
              clearInterval(pingIntervalId);
              return ws.close();
            }
            ws.ping();
          }, 5000);
        });

        if (wsError) ws.on('error', wsError);

        ws.on('close', function () {
          connect();
        });

        ws.on('pong', function () {
          lastPong = Date.now();
        });
      });
    }
  }

  connect();
};
