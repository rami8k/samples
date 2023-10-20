import { InputEmail } from "./InputEmail"

export class ValidateEmailsRequest {
  appKey: string
  requestId: string
  providerClass: string
  gracePeriod: number
  inputEmails: InputEmail[]
  customValidationEndpoint?: string
  ownerEmail?: string
  deleteAfterValidation?: boolean
}