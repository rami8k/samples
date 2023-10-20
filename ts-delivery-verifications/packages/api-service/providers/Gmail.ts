import { IProvider } from './IProvider'
import { Message } from './Message'
import { MessagesFilter } from './MessageFilter'
import { google, gmail_v1, Auth } from 'googleapis';

export class Provider implements IProvider {
  mailClient: Auth.OAuth2Client;
  gmail: gmail_v1.Gmail

  constructor(mailClient: Auth.OAuth2Client) { 
    this.gmail = google.gmail({ version: 'v1', auth: mailClient})
  }
  
  async getNewMessages(filter): Promise<Message[]> {
    const args = { userId: 'me', q: `is:unread in:inbox category:primary` }//, maxResults: MAX_EMAIL_BATCH}
    const response = await this.gmail.users.messages.list(args)

    const messages = await response.data.messages
    const mappedMessaged = await Promise.all(messages.map(async x => {
      return await this.getMessage(x.id)
    }))

    return mappedMessaged
  }
  
  async getMessage(id): Promise<Message> {
    const args = { userId: 'me', id: id }
    const response = await this.gmail.users.messages.get(args)
    return this.mapMessage(response.data)
  }
  
  async deleteMessage(id) {
    const args = {  userId: 'me', id: id, addLabelIds: ['TRASH'], removeLabelIds: ['INBOX', 'UNREAD'] }
    await this.gmail.users.messages.get(args)
  }

  async deleteMessages(ids) {
    let args = { userId: 'me', ids: ids, addLabelIds: ['TRASH'], removeLabelIds: ['INBOX', 'UNREAD'] };
    await this.gmail.users.messages.batchModify(args);
  }

  async deleteAll() {
  }

  async markRead(ids) {
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