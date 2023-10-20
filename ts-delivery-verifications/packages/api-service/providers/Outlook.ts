import { IProvider } from './IProvider'
import { Message } from './Message'
import { MessagesFilter } from './MessageFilter'
import * as graph from '@microsoft/microsoft-graph-client'

export class Provider implements IProvider {
  mailClient: graph.Client

  constructor(mailClient: graph.Client) {
    this.mailClient = mailClient
  }

  async getNewMessages(filter: MessagesFilter): Promise<Message[]> {
    const newMessages = await this.mailClient.api('/me/messages')
    .select(['subject', 'sender', 'body'])
    // .filter('some condition')
    .top(100)
    .get()

    return newMessages.value
  }

  async getMessage(id): Promise<Message> {
    return await this.mailClient.api(`/me/messages${id}`).get()
  }

  async deleteMessage(id: string) {
    await this.mailClient.api(`/me/messages/${id}`).delete()
  }

  async deleteMessages(ids: string[]) {
    ids.forEach(x => {
      this.deleteMessage(x)
    })
  }

  async deleteAll() {
  }

  async markRead(ids) {
    ids.forEach(async x => {
      await this.mailClient.api(`/me/messages/${x}`).update({ isRead: true })
    });
  }

  messageSubject(message) {
    const subjectHeader = message.payload.headers.find(x => x.name === 'Subject')
    return subjectHeader.value
  }

  private mapMessage(message) {
    return new Message(message.id, this.getMessageHeadere(message, 'Subject'), this.getMessageHeadere(message, 'From'), message.payload.body)
  }

  private getMessageHeadere(message, header: string) {
    const subjectHeader = message.payload.headers.find(x => x.name === header)
    return subjectHeader.value
  }
}