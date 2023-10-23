import * as express from 'express'
import * as cors from 'cors'
import * as awsServerlessExpressMiddleware from '@vendia/serverless-express/middleware'
import { ViewsService } from './services/ViewsService'

const localRegex = '(http|https):\/\/([a-z0-9]+[.-])*(local){1}[.](domain1|domain2|domain3)[.]com'
const corsRegex = 'https:\/\/([a-z0-9]+[.-])*(domain1|domain2|domain3)[.]com'

export const createApp = () => {
  const corsOptions = {
    origin: function(origin, callback) {
      if (!origin || origin.match(corsRegex) || origin.match(localRegex)) {
        callback(null, true)
      } else {
        console.log('origin', origin)
        callback(null, false)
      }
    },
    optionsSuccessStatus: 200
  }

  let app = express()
  app.use(express.json())
  app.use(awsServerlessExpressMiddleware.eventContext())

  function wrapAsync(fn) {
    return function(req, res, next) {
      fn(req, res, next).catch(next)
    }
  }

  app.get('/history', cors(corsOptions), wrapAsync(async(req, res) => {
    if(!req.apiGateway.event.requestContext.authorizer.user) {
      res.status(400).send('`user` is missing in the authentication token')
      return
    }

    const viewDate = req.query.viewDate ? req.query.viewDate : (Math.floor(Date.now() / 1000) - (3600 * 24 * 7)).toString()
    const viewsService = new ViewsService()
    const userHistory = await viewsService.getUserHistory(req.apiGateway.event.requestContext.authorizer.user.toString(), viewDate)

    res.send(userHistory)
  }))

  app.post('/view', cors(corsOptions), wrapAsync(async(req, res) => {
    if(!req.query.user || !req.query.channel || !req.query.article) {
      res.status(400).send('parameters `user`, `channel, `article` are required')
      return
    }

    const userId = req.query.user //!!req.apiGateway.event.requestContext.authorizer ? req.apiGateway.event.requestContext.authorizer.user : 0

    const viewsService = new ViewsService()
    const result = await viewsService.addUserHistory(userId.toString(), req.query.channel, req.query.article)

    res.send(result)
  }))

  app.get('/popular', cors(corsOptions), wrapAsync(async(req, res) => {
    const viewsService = new ViewsService()

    const count = req.query.count ? parseInt(req.query.count) : 10

    if(!req.query.channel) {
      const result = await viewsService.getPopularArticles(count)
      res.send(result)
      return
    }

    const result = await viewsService.getChannelViews(req.query.channel, count)
    res.send(result)
  }))

  app.get('/healthcheck', cors(corsOptions), (req, res) => {
    res.send('_AOK_')
  })

  app.get('/error', cors(corsOptions), (req, res) => {
    throw new Error('test error')
  })

  return app
}
