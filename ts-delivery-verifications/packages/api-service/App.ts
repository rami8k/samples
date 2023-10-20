import * as express from 'express'
import * as cors from 'cors'
import * as awsServerlessExpressMiddleware from 'aws-serverless-express/middleware'
import { saveSecret } from './helpers/aws'
import { AuthService } from './services/Auth'
import { MailService } from './services/MailService'
import { IClient } from './clients/IClient'
import { InputEmail } from './services/InputEmail'
import { Slack } from './services/Slack'

const localRegex = '(http|https):\/\/([a-z0-9]+[.-])*(local){1}[.](domain1|domain2)[.]com'
const corsRegex = 'https:\/\/([a-z0-9]+[.-])*(domain1|domain2)[.]com'

export const createApp = () => {
  const corsOptions = {
    origin: function(origin, callback) {
      if (!origin || origin.match(corsRegex) || origin.match(localRegex)) {
        callback(null, true)
      } else {
        callback(null, false)
      }
    },
    optionsSuccessStatus: 200
  }

  const hstsSetter = function(req, res, next) {
    res.set('Strict-Transport-Security', 'max-age=1440')
    next()
  }

  let app = express()
  app.use(express.json())
  app.use(awsServerlessExpressMiddleware.eventContext())
  app.use(hstsSetter)

  function wrapAsync(fn) {
    return function(req, res, next) {
      fn(req, res, next).catch(next)
    }
  }

  app.get('/register', cors(corsOptions), wrapAsync(async(req, res) => {
    if(!req.query.appKey || !req.query.email) {
      res.status(400).send('query parameters `appKey`, `email` are required')
      return
    }

    const authService = new AuthService()
    const token = await authService.register(req.query.appKey, req.query.email)
    res.send(token)
  }))

  app.get('/authorize', cors(corsOptions), wrapAsync(async(req, res) => {
    if(!req.query.appKey || !req.query.provider) {
      res.status(400).send('query parameters `appKey`, `provider` are required')
      return
    }

    if(!['Outlook', 'OutlookAdmin', 'Gmail'].includes(req.query.provider)) {
      res.status(400).send('`provider` should be one of `Outlook,OutlookAdmin,Gmail`')
      return
    }

    const clientImport = await import(`./clients/${req.query.provider}`)
    const ClientClass = clientImport.Client
    const client = new ClientClass() as IClient

    const authUrl = await client.getAuthUrl()
    res.send(authUrl)
  }))

  app.get('/auth_callback/:provider/:appKey', cors(corsOptions), wrapAsync(async(req, res) => {
    if (req.params.appKey === 'app-key') {
      res.send('replace `app-key` in the URL with your application key you used with the `authorize` request.')
      return
    }

    const clientImport = await import(`./clients/${req.params.provider}`)
    const ClientClass = clientImport.Client
    const client = new ClientClass() as IClient
    const credentials = await client.authorize(req.query.code)

    await saveSecret(`/team/edv/${req.params.appKey}`, JSON.stringify(credentials))
    res.send('app credentials were stored successfully.')
  }))

  app.post('/validate', cors(corsOptions), wrapAsync(async(req, res) => {
    console.log('Request ID', req.body.requestId)

    const { appKey, email } = req.apiGateway.event.requestContext.authorizer

    if (req.body.appKey !== appKey || req.body.email !== email) {
      res.status(400).send('Invalid authorization token, appKey or email does not match!')
      return
    }

    if (!req.body) {
      res.status(400).send('invalid json input')
      return
    }

    const mailService = new MailService()
    const result = await mailService.validateEmails({
      requestId: req.body.requestId,
      appKey: req.body.appKey,
      providerClass: req.body.provider,
      gracePeriod: req.body.gracePeriod,
      inputEmails: req.body.inputEmails.map(x => new InputEmail(x.subject, x.sender, x.validationString, x.metadata)),
      customValidationEndpoint: req.body.customValidationEndpoint,
      ownerEmail: req.body.email,
      deleteAfterValidation: req.body.deleteAfterValidation
    })

    const slack = new Slack(req.body.slackWebhookURL, req.body.slackChannel)
    await slack.sendNotifications(result, req.body.gracePeriod)

    res.status(200).send(result)
  }))

  app.post('/cleanup', cors(corsOptions), wrapAsync(async(req, res) => {
    if(!req.query.provider) {
      res.status(400).send('query parameters `provider` is required')
      return
    }

    if(!['Outlook', 'OutlookAdmin', 'Gmail'].includes(req.query.provider)) {
      res.status(400).send('`provider` should be one of `Outlook,OutlookAdmin,Gmail`')
      return
    }

    const { appKey, email } = req.apiGateway.event.requestContext.authorizer

    console.log(`Starting cleanup job for ${email}`)

    const mailService = new MailService()
    await mailService.cleanupMailbox({
      appKey,
      providerClass: req.query.provider,
      ownerEmail: email
    })
  }))

  app.get('/healthcheck', cors(corsOptions), (req, res) => {
    res.send('_AOK_')
  })

  app.get('/error', cors(corsOptions), (req, res) => {
    throw new Error('test error')
  })

  return app
}