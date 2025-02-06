const express = require('express');
const serverless = require('serverless-http');
const app = express();

// Import your server routes and middleware here
const api = require('../../server');

app.use('/.netlify/functions/api', api);

module.exports.handler = serverless(app);
