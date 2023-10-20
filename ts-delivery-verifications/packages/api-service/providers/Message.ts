export class Message {
  id: string
  subject: string
  sender: string
  body: any

  constructor(id: string, subject: string, sender: string, body?: string) { 
    this.id = id
    this.subject = subject
    this.sender = sender
    this.body = body
  }
}