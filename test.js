var slackRTMPresence = require('./index');

var connectionError = function (err, reconnect) {
  console.log(err);
  reconnect();
}

var slackError = function (err, reconnect) {
  console.log(err)
  if (err.message === 'invalid_auth' || err.message === 'account_inactive' || err.message === 'not_authed') return reconnect(false);
  reconnect();
}

var wsError = console.log;

slackRTMPresence(process.env.token, connectionError, slackError, wsError);
