'use strict'

const slackClient = require('../server/slackClient');
const service = require('../server/service');
const http = require('http');

// Connect iris to the slack server
const witToken = process.env.WIT_TOKEN;
const witClient = require('../server/witClient')(witToken);

const slackToken = process.env.SLACK_TOKEN;
const slackLogLevel = 'verbose';
const rtm = slackClient.init(slackToken, slackLogLevel, witClient);
rtm.start();

// Start express server and listen only on successful connection
const server = http.createServer(service);
slackClient.addAuthenticatedHandler(rtm, () => server.listen(3000));

server.on('listening', function() {
  console.log(`IRIS is listening on ${server.address().port} in ${service.get('env')} mode.`)
})
