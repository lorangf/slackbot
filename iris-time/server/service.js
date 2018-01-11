'use strict';

const express = require('express');
const service = express();
const request = require('superagent');
const moment = require('moment');

service.get('/service/:location', (req, res, next) => {
  request.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${req.params.location}&key=AIzaSyBz4-SUtoJ2NOQ7CZF5m1xnHG7L9NQwq1c`, (err, response) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    const location = response.body.results[0].geometry.location;
    const timestamp = +moment().format('X'); // + means integer back

    request.get(`https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat},${location.lng}&timestamp=${timestamp}&key=AIzaSyD3spxXZIxF6thL_uvVg33yu_m9y15IRWk`, (err, response) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      const result = response.body;
      const timeString = moment.unix(timestamp+result.dstOffset+result.rawOffset).utc().format('dddd MMMM Do YYYY, hh:mm:ss a');
      res.json({result: timeString});
    })
  })
});

module.exports = service;
