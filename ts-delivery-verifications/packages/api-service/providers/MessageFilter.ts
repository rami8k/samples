export class MessagesFilter {
  senderEmail: string

  constructor(senderEmail: string, subjects: string[]) { 
    this.senderEmail = senderEmail
  }

  private constructSubjectsFilter(subjects: string[]) {
    return subjects.reduce(x => `subject: (${x}) OR `, '')
  }
}