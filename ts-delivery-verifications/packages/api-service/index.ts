import * as dotenv from 'dotenv'
import { Slack } from './services/Slack'
import { InputEmail } from './services/InputEmail'
import { MailService } from './services/MailService'

dotenv.config()

const inputEmails: InputEmail[] = [
  new InputEmail('Your Buyer Power has Changed', 'rkhasawneh@c.com', 'aaa', { 'Channel': 'TEST_TT', 'Email ID': 'aaa-bbb-ccc-ddd' }),
  new InputEmail('An invitation from Venmo.', 'venmo@email.venmo.com', 'aaa',{ 'Channel': 'TEST_TT', 'Email ID': 'aaa-bbb-ccc-ddd' }),
  new InputEmail('Test 2', 'rkhasawneh@c.com', 'ttt', { 'Channel': 'TEST_TT', 'Email ID': 'aaa-bbb-ccc-ddd' })
]

async function main() {
  console.log('main', 1)
  const mailService = new MailService()
  const result = await mailService.validateEmails({
    requestId: "123",
    appKey: 'BU-newsletters',
    providerClass: 'OutlookAdmin',
    gracePeriod: 5,
    inputEmails,
    ownerEmail: 'all_email_monitoring@c.com'
  })



  console.log('result', result)
}

async function delete1() {
  const mailService = new MailService()
  await mailService.cleanupMailbox({
    appKey: 'BU-newsletters',
    providerClass: 'OutlookAdmin',
    ownerEmail: 'all_email_monitoring@c.com'
  })
}

delete1()

main()
