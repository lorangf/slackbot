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

    //api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}

    request.get(`https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=dafb6982a087538efde689c8e7ec0e6f`, (err, response) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      const body = response.body;
      res.json({result: `${body.weather[0].description} at ${body.main.temp} degrees`});
    })
  })
});

module.exports = service;
