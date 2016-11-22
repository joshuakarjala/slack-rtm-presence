# slack-rtm-presence
A lightweight way to keep your bot "present" in all teams.

Currently, if you want to have a green light next to your bot, Slack requires you to keep an open Web Socket connection to each team that your bot is in. This module takes a team `token` and opens a Web Socket connection to the team. If the connection at any time goes stale or is closed, the module will try to open a new connection.

Mixes well with https://github.com/FoundersAS/slack-events-listener when using the Slack Events Api.

## Install

```
$ npm install slack-rtm-presence
```

## Usage
You just call the module with a `teamToken` and functions `connectionError` and `slackError`. These both call `reconnect()` to attempt to reconnect to slack. If you call `reconnect(false)` with a value the module will stop trying to reconnect for this team. This is important as it terminates any Web Socket and all event listeners.

You can optionally pass a third function `wsError` which will receive any errors from the Web Socket itself.

```javascript
var slackRTMPresence = require('slack-rtm-presence');

var connectionError = function (err, reconnect) {
  console.log(err);
  reconnect();
}

var slackError = function (err, reconnect) {
  console.log(err)

  // on some specific error messages we might not want to reconnect
  if (err.message === 'invalid_auth' || err.message === 'account_inactive' || err.message === 'not_authed') return reconnect(false);
  reconnect();
}

var wsError = console.log;

slackRTMPresence(process.env.token, connectionError, slackError, wsError);

```

# Credits
The pattern used to check for a stale Web Socket connection is borrowed from the good work of https://github.com/howdyai/botkit.
