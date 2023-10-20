import { IProvider } from './IProvider'
import { Message } from './Message'
import * as graph from '@microsoft/microsoft-graph-client'

export class Provider implements IProvider {
  ownerEmail: string
  mailClient: graph.Client
  attepmts: number = 3

  constructor(mailClient: graph.Client, ownerEmail: string) {
    this.ownerEmail = ownerEmail
    this.mailClient = mailClient
  }

  async getNewMessages(subjects): Promise<Message[]> {
    const subjectsFilter = this.formatSubjectsFilter(subjects)
    const filter = `isRead eq false and (${subjectsFilter})`

    let attempt = 0
    while(attempt < this.attepmts) {
      console.log(attempt)
      attempt++
      try {
        return await this.fetchMessages({ filter })
      } catch(err) {
        console.log(`failed to fetch messages attempt #${attempt}, retrying.`, err)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  async getMessage(id): Promise<Message> {
    return await this.mailClient.api(`/users/${this.ownerEmail}/messages/${id}`).get()
  }

  async deleteMessage(id) {
    await this.mailClient.api(`/users/${this.ownerEmail}/messages/${id}`).delete()
  }

  async deleteMessagesInBatches(ids) {
    const batchSize = 20

    let batches = []
    let batchRequestContent = new graph.BatchRequestContent()

    // create batches
    for (let i=0; i < ids.length; i++) {
      // add a delete request per message id
      batchRequestContent.addRequest({
        id: (i + 1).toString(),
        request: new Request(`/users/${this.ownerEmail}/messages/${ids[i]}`, {
          method: "DELETE"
        })
      })

      // if batch size is devidable by batch size with no remainder add batch and reset, skip 0 as it always devides with no remainder
      if (i > 0 && (i + 1) % batchSize == 0) {
        batches.push(batchRequestContent)
        batchRequestContent = new graph.BatchRequestContent()
      }
    }

    // add remainder batch as it will be skipped in the for loop
    if(batchRequestContent.requests.size > 0) {
      batches.push(batchRequestContent)
    }

    // send a request per batch and wait to avoid throttling
    batches.forEach(async x => {
      let content = await x.getContent()
      const resp = await this.mailClient.api('/$batch').post(content)
      console.log(resp)
      await new Promise(resolve => setTimeout(resolve, 20000))
    })
  }

  async deleteMessages(ids) {
    console.log('Deleting', ids)

    let undeleted = []

    ids.forEach(async id => {
      await this.mailClient.api(`/users/${this.ownerEmail}/messages/${id}`).delete((error, response) => {
        console.log(`Deleting ${id} error:`, error)
        console.log(`Deleting ${id} response:`, response)

        if(error) {
          undeleted.push(id)
        }
      })
      await new Promise(resolve => setTimeout(resolve, 10000))
    })

    if(undeleted.length) {
      await this.deleteMessages(undeleted)
    }
  }

  async deleteAll() {
    const allMessages = await this.getAllMessages()
    await this.deleteMessages(allMessages.map(x => x.id))
  }

  async markRead(ids) {
    ids.forEach(async id => {
      await this.mailClient.api(`/users/${this.ownerEmail}/messages/${id}`).update({ isRead: true })
    });
  }

  messageSubject(message) {
    const subjectHeader = message.payload.headers.find(x => x.name === 'Subject')
    return subjectHeader.value
  }

  private async getAllMessages() {
    const batchSize = 1000
    let batchNumber = 1

    let allMessages = []
    let newMessages = await this.fetchMessages({ fields: ['id'], batchSize })

    while (newMessages.length > 0) {
      allMessages = allMessages.concat(newMessages)
      newMessages = await this.fetchMessages({ fields: ['id'], skip: batchNumber * batchSize, batchSize })
      batchNumber++
    }

    return allMessages
  }

  private async fetchMessages({
    fields = ['subject', 'sender', 'body', 'receivedDateTime'],
    filter = '',
    skip = 0,
    batchSize = 100
  }) {
    console.log('filter', filter)
    const newMessages = await this.mailClient.api(`/users/${this.ownerEmail}/messages`)
      .select(fields)
      .filter(filter)
      .skip(skip)
      .top(batchSize)
      .get()

    return newMessages.value
  }

  /**
   * format MS Graph filter out of email subjects
   */
  private formatSubjectsFilter(subjects: string[]): string {
    let filter = ''
    for (let i = 0; i < subjects.length; i++) {
      const subject = encodeURIComponent(subjects[i].replace('\'', '\'\''))
      filter += `subject eq '${subject}'`
      if (i < subjects.length - 1) {
        filter += ' or '
      }
    }
    return filter
  }
}