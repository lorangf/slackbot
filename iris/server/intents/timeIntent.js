'use strict';

const request = require('superagent');

module.exports.process = function process(intentData, registry, cb) {
    if ( intentData.intent[0].value !== 'time') {
      return cb(new Error(`Expected time intent, got ${intentData.intent[0].value}`))
    }
    if ( !intentData.location ) {
      return cb(new Error('Missing location in time intent'));
    }

    const location = intentData.location[0].value;
    const service = registry.get('time');
    if (!service) {
      return cb(null, 'No service available');
    }

    console.log(service);
    const url = `http://${service.ip}:${service.port}/service/${location}`;
    console.log(url);

    request.get(url, (err, res) => {
      if ( err || res.statusCode != 200 || !res.body.result ) {
        console.log(err);

        return cb(null, `I had a problem finding out the time in ${location}``);
      }

      return cb(null, `In ${location}, it is now ${res.body.result}`);
    })
}
