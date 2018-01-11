'use strict'

const { RtmClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
let rtm = null;
let nlp = null;
let registry = null;
// Cache of data
const appData = {};

function handleOnAuthenticated(connectData) {
  appData.selfId = connectData.self.id;
  console.log(`Logged in as ${connectData.self.name} of team ${connectData.team.name}`);
}

function handleOnMessage(message) {
  if ( message.text.toLowerCase().includes('iris') ) {
    nlp.ask(message.text, (err, res) => {
      if (err) {
        console.log(err);
        return;
      }

      try {
        if ( !res.intent || !res.intent[0] || !res.intent[0].value ) {
          throw new Error("Could not extract intent.")
        }

        const intent = require('./intents/' + res.intent[0].value + 'Intent');

        intent.process(res, registry, (error, response) => {
          if ( error ) {
            console.log(message);
            return;
          }
          return rtm.sendMessage(response, message.channel);
        })

      } catch(e) {
        console.log(err);
        console.log(res);
        rtm.sendMessage("Sorry I don't know what you are talking about", message.channel);
      }
    });
  }
}

function addAuthenticatedHandler(rtm, handler) {
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler);
}

module.exports.init = function stackClient(token, myLogLevel, nlpClient, serviceRegistry) {
  // Initialize the RTM client with the recommended settings. Using the defaults for these
  // settings is deprecated.
  rtm = new RtmClient(token, {
    dataStore: false,
    useRtmConnect: true,
    logLevel: myLogLevel,
  });

  nlp = nlpClient;
  registry = serviceRegistry;

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
