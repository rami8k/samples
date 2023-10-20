'use strict';

const newrelic = require('newrelic')
const awsServerlessExpress = require('aws-serverless-express')
const server = require('./Server')

const server = awsServerlessExpress.createServer(server)
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)