import { DeliveryStatus, InputEmail } from "./InputEmail"

const fetch = require('node-fetch')

export enum MessageType {
  Good = 'Good',
  Danger = 'Danger',
  Warning = 'Warning'
}

export class Notification {
  lines: Array<string>
  type: MessageType

  constructor(lines: Array<string>, type: MessageType) {
    this.lines = lines
    this.type = type
  }
}

export class Slack {
  webHookUrl: string
  channelName: string

  colors = {
    'Good': '#008000',
    'Danger': '#ff0000',
    'Warning': '#eed202'
  }

  emojis = {
    'Good': ':ablobcheer:',
    'Danger': ':ablobsweating:'
  }

  constructor(webHookUrl: string, channel: string) {
    this.webHookUrl = webHookUrl
    this.channelName = channel
  }

  /**
   * Format message array into json before sending to slack
   * @param notifications slack notification object array
   */
  async sendNotifications(inputEmails: Array<InputEmail>, gracePeriod: number) {
    const notifications = this.formatNotifications(inputEmails, gracePeriod)
    await this.sendToSlack(notifications)
  }

  /**
   * Format message array into json before sending to slack
   * @param notifications slack notification object array
   */
  private formatNotifications(inputEmails: Array<InputEmail>, gracePeriod: number) {
    const notifications = inputEmails.map(x => {
      let messageLines = []
      let emoji = this.emojis.Good
      let messageType = MessageType.Good

      if(x.status === DeliveryStatus.Failed) {
        // messageLines.push('@channel')
        emoji = this.emojis.Danger
        messageType = MessageType.Danger
      }

      messageLines.push(`${emoji} Delivery: *${x.status}*, for subject *"${x.subject}"* with validation string *"${x.validationString}"* after waiting for *~${gracePeriod}* minutes`)

      if(x.metadata) {
        Object.entries(x.metadata).forEach(([key, value]) => messageLines.push(`${key}: ${value}`))
      }

      return this.createNotification(messageType, messageLines)
    })

    return notifications
  }

  /**
   * send array of slack json messages to a slack channel using slack webhook url
   * @param notifications array of slack json messages
   */
  private async sendToSlack(notifications: Array<any>) {
    try {
      await fetch(this.webHookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"attachments": notifications})
      }).then(response => console.log(response))
    } catch (error) {
      console.log(`Error while sending message to ${this.channelName} slack channel. Message: ${notifications}, Error: ${error}`)
    }
  }

  /**
   * format slack message body
   * @param {Notification} notification slack notification object
   * @returns slack message json
   */
  private createNotification(type: MessageType, lines: Array<string>) {
    return {
      'color': this.colors[type],
      'blocks': lines.map(x => {
        return {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': x
          }
        }
      })
    }
  }
}
