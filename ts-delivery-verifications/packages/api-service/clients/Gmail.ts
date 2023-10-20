import { google } from 'googleapis'
import { getSecret } from '../helpers/aws'

import { IClient } from './IClient'
import { IClientParams } from './IClientParams'

export class Client implements IClient {
  scopes = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.modify']
  callbackUri = `${process.env.AUTH_CALLBACK_URL}/Gmail/app-key`

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   *
   * @param {google.auth.OAuth2} client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback to call with the authorized
   *     client.
   */
  async getAuthUrl() {
    const clientParams = await this.getClientParams()
    const oAuth2Client = new google.auth.OAuth2(clientParams.clientId, clientParams.clientSecret, this.callbackUri)
    return await oAuth2Client.generateAuthUrl({
      scope: this.scopes,
      access_type: 'offline'
    })
  }

  async authorize(code: string) {
    const clientParams = await this.getClientParams()
    const oAuth2Client = new google.auth.OAuth2(clientParams.clientId, clientParams.clientSecret, this.callbackUri)

    const token = await oAuth2Client.getToken(code)
    return token.tokens
  }

  async reAuthorize(refereshToken: string) {
    return {}
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   *
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  async getClient(credentials: any) {
    const clientParams = await this.getClientParams()
    const oAuth2Client = new google.auth.OAuth2(clientParams.clientId, clientParams.clientSecret)
    oAuth2Client.setCredentials({access_token: credentials.access_token})
    return oAuth2Client
  }

  private async getClientParams() {
    const credentials = await getSecret('/team/edv/GOOGLE_CREDENTIALS')
    return JSON.parse(credentials.value) as IClientParams
  }
}