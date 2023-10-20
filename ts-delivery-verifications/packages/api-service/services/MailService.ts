import fetch from 'node-fetch'
import { IClient } from '../clients/IClient'
import { IProvider } from '../providers/IProvider'
import { Message } from '../providers/Message'
import { InputEmail, DeliveryStatus } from './InputEmail'
import { getSecret, saveSecret } from '../helpers/aws'
import { ValidateEmailsRequest } from './ValidateEmailsRequest'
import { CleanupRequest } from './CleanupRequest'

export class MailService {
  /**
   * Check if a list of emails were delivered to target mailbox
   *
   * @param {number} gracePeriod Wait time before emails might be available.
   * @param {InputEmail[]} emails List of emails to verify.
   * @param {string} customValidationEndpoint a custom endpoint to validate email against.
   */
  async validateEmails(vallidationRequest: ValidateEmailsRequest) {
    const { appKey, providerClass, gracePeriod, customValidationEndpoint, ownerEmail, deleteAfterValidation, requestId } = vallidationRequest
    let { inputEmails } = vallidationRequest

    console.log('Request ID', requestId)

    console.log('inputEmails', inputEmails)

    await new Promise(resolve => setTimeout(resolve, gracePeriod * 60000))

    const mailProvider = await this.getProvider(appKey, providerClass, ownerEmail)

    // get all emails with input subjects
    let deliveredEmails = await mailProvider.getNewMessages(inputEmails.map(x => x.subject))
    console.log('newEmails.length', deliveredEmails.length)

    // if no new emails have a subject that match with any of the input emails: fail and exit
    if (deliveredEmails.length === 0) {
      console.log(`Emails were not delivered!`)
      inputEmails.forEach(x => {
        x.status = DeliveryStatus.Failed
        x.statusMessages.push('undelivered')
      })

      return inputEmails
    }

    // get list of undelivered subjects
    const undelivered = this.getUndeliveredEmails(inputEmails, deliveredEmails)
    if (deliveredEmails.length < inputEmails.length) {
      console.log(`Some Emails were not delivered!\r\nUndelivered emails: ${undelivered.map(x => x.subject).join(' , ')}`)
    }

    // update the inputs list with status code based on wether its subject exists in the new emails list from the mailbox
    const undeliveredSubjects = undelivered.map(x => x.subject)
    inputEmails.forEach(x => {
      if (undeliveredSubjects.includes(x.subject)) {
        x.status = DeliveryStatus.Failed
        x.statusMessages.push('undelivered')
      } else {
        x.status = DeliveryStatus.Success,
        x.statusMessages.push('delivered')
      }
    })

    if (customValidationEndpoint) {
      const result = await this.validateWithEndpoint(deliveredEmails, customValidationEndpoint)
      const invalid = result.filter(x => !x.status)

      if (invalid.length > 0) {
        const errorString = this.mapCustomValidationError(invalid)
        console.log(`Some Emails were not validated with custom validation endpoint!\r\n${errorString})}`)

        const invalidSubjects = invalid.map(x => x.subject)
        inputEmails.forEach(x => {
          if (invalidSubjects.includes(x.subject)) {
            x.status = DeliveryStatus.Failed
            x.statusMessages.push('delivered but failed custom validation')
          }
        })
      }
    }

    // check if an input email exists in the list of delivered emails(by subject) with the validation string in the body
    inputEmails.forEach(inputEmail => {
      // get all new emails from the mailbox that match the input email subject and contain the validation string
      const emailWithInputSubjectAndValidationString = deliveredEmails.find(x => x.body.content.includes(inputEmail.validationString))

      console.log('emailWithInputSubjectAndValidationString', emailWithInputSubjectAndValidationString)

      // if the validation string was found in any of the new emails
      if(emailWithInputSubjectAndValidationString) {
        inputEmail.id = emailWithInputSubjectAndValidationString.id
        inputEmail.status = DeliveryStatus.Success
        inputEmail.statusMessages.push('delivered with the correct validation string')
      } else {
        inputEmail.status = DeliveryStatus.Failed
        inputEmail.statusMessages.push('delivered with the incorrect validation string')
        console.log(JSON.stringify(deliveredEmails, null, 4));
      }
    })

    // TODO: delete fails randomly and doesn't move emails to Deleted Items folder(temp comment to allow slack messages to go through)
    if(deleteAfterValidation) {
      await mailProvider.markRead(inputEmails.filter(x => x.status === DeliveryStatus.Success).map(x => x.id))
    }
    console.log('Delivery Reults', inputEmails)

    return inputEmails
  }

  /**
   * Delete all emails in a mailbox
   *
   * @param {CleanupRequest} cleanupRequest Object that contains all the parameters for a cleanup request
  */
  async cleanupMailbox(cleanupRequest: CleanupRequest) {
    const { appKey, providerClass, ownerEmail } = cleanupRequest

    const mailProvider = await this.getProvider(appKey, providerClass, ownerEmail)

    await mailProvider.deleteAll()
  }

  /**
   * Get cloud provider
   *
   * @param {string} appKey The registered application key, ex: BU-newsletters
   * @param {string} providerClass The cloud provider type, ex: Outlook, Google
   */
  private getProvider(appKey: string, providerClass: string, ownerEmail: string): Promise<IProvider> {
    if(providerClass === 'OutlookAdmin') {
      return this.getAdminProvider(ownerEmail)
    }
    return this.getConsentProvider(appKey, providerClass)
  }

  /**
   * Get consent cloud provider type
   *
   * @param {string} appKey The registered application key, ex: BU-newsletters
   * @param {string} providerClass The cloud provider type, ex: Outlook, Google
   */
  private async getConsentProvider(appKey: String, providerClass: String): Promise<IProvider> {
    const clientImport = await import(`../clients/${providerClass}`)
    const ClientClass = clientImport.Client
    const client = new ClientClass() as IClient

    const providerImport = await import(`../providers/${providerClass}`)
    const ProviderClass = providerImport.Provider

    let appCredentials = await getSecret(`/team/edv/${appKey}`)
    if (!appCredentials) {
      throw new Error('application is not registered')
    }

    const tokeDate = new Date(appCredentials.lastModified)
    const expireDate = new Date()
    expireDate.setDate(expireDate.getDate() - 90)

    if (tokeDate < expireDate) {
      console.log('Token expired! refreshing and storing new token.')
      appCredentials = await client.reAuthorize(appCredentials.refreshToken)
      await saveSecret(`/team/edv/${appKey}`, JSON.stringify(appCredentials))
    }

    const mailClient = await client.getClient(JSON.parse(appCredentials))
    return new ProviderClass(mailClient) as IProvider
  }

  /**
   * Get Azure Cloud admin provider for outlook
   */
  private async getAdminProvider(ownerEmail: string): Promise<IProvider> {
    const { Client } = await import('../clients/OutlookAdmin')
    const { Provider } = await import('../providers/OutlookAdmin')

    const client = new Client()
    const mailClient = await client.getClient()
    return new Provider(mailClient, ownerEmail)
  }

  /**
   * filter new emails based on input emails
   *
   * @param {InputEmail[]} InputEmail list of input emails
   * @param {Message} newEmails list of new emails
   */
  private getDeliveredEmails(inputEmails: InputEmail[], newEmails: Message[]) {
    const inputEmailsSubjects = inputEmails.map(x => x.subject)
    console.log('inputEmailsSubjects', inputEmailsSubjects)
    const newEmailsSubjects = newEmails.map(x => x.subject)
    console.log('newEmailsSubjects', newEmailsSubjects)
    return newEmails.filter(x => inputEmailsSubjects.includes(x.subject))
  }

  /**
   * filter undelivered emails based on input emails
   *
   * @param {InputEmail[]} InputEmail list of input emails
   * @param {Message} newEmails list of new emails
   */
  private getUndeliveredEmails(inputEmails: InputEmail[], newEmails: Message[]) {
    const newEmailsSubjects = newEmails.map(x => x.subject)
    return inputEmails.filter(x => !newEmailsSubjects.includes(x.subject))
  }

  /**
   * validate delivered emails by calling a custom endpoint provided by the called
   *
   * @param {Message[]} messages list of emails to validate
   * @param {string} customValidationEndpoint http endpoint
   */
  private async validateWithEndpoint(messages: Message[], customValidationEndpoint: string): Promise<any> {
    try {
      return await fetch(`${customValidationEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(messages)
      })
      .then(res => res.json())
    } catch (err) {
      console.error(err)
      return {}
    }
  }

  private mapCustomValidationError(validationResponse: any[]) {
    validationResponse.map(x => `${x.error} -> ${x.subject}`).join('\r\n')
  }
}

