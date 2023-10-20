export enum DeliveryStatus {
  Success = 'Success',
  Failed = 'Failed'
}

export class InputEmail {
  subject: string
  sender: string
  validationString?: string
  status?: DeliveryStatus
  statusMessages?: Array<string> = []
  metadata?: any
  id?: string

  constructor(subject?: string, sender?: string, validationString?: string, metadata?: any) {
    this.subject = subject
    this.sender = sender
    this.validationString = validationString
    this.statusMessages = [],
    this.metadata = metadata
  }
}