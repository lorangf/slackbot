'use strict'

const { RtmClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
let rtm = null;
let nlp = null;
// Cache of data
const appData = {};

function handleOnAuthenticated(connectData) {
  appData.selfId = connectData.self.id;
  console.log(`Logged in as ${connectData.self.name} of team ${connectData.team.name}`);
}

function handleOnMessage(message) {

  nlp.ask(message.text, (err, res) => {
    if (err) {
      console.log(err);
      return;
    }

    if (!res.intent) {
      return rtm.sendMessage("Sorry I don't know what you are talking about", message.channel);
    } else if (res.intent[0].value == 'time' && res.location) {
      return rtm.sendMessage(`I don't yet know the time in ${res.location[0].value}`, message.channel);
    } else {
      console.log(res);
      return rtm.sendMessage("Sorry I don't know what you are talking about", message.channel);
    }

    rtm.sendMessage('Sorry I did not understand.', message.channel, function messageSent() {
      // Optional callback
    })
  });

}

function addAuthenticatedHandler(rtm, handler) {
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler);
}

module.exports.init = function stackClient(token, myLogLevel, nlpClient) {
  // Initialize the RTM client with the recommended settings. Using the defaults for these
  // settings is deprecated.
  rtm = new RtmClient(token, {
    dataStore: false,
    useRtmConnect: true,
    logLevel: myLogLevel,
  });

  nlp = nlpClient;

  // The client will emit an RTM.AUTHENTICATED event on when the connection data is avaiable
  // (before the connection is open)
  addAuthenticatedHandler(rtm, handleOnAuthenticated);

  rtm.on(RTM_EVENTS.MESSAGE, handleOnMessage);

  // The client will emit an RTM.RTM_CONNECTION_OPEN the connection is ready for
  // sending and recieving messages
  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPEN, () => {
    console.log(`Ready`);
  });

  return rtm;
}

module.exports.addAuthenticatedHandler = addAuthenticatedHandler;
