'use strict';

const newrelic = require('newrelic')
const awsServerlessExpress = require('@vendia/serverless-express')
const app = require('./Server')

const server = awsServerlessExpress.createServer(app)
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)
