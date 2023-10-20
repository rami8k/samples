import * as msal from '@azure/msal-node'
import * as graph from '@microsoft/microsoft-graph-client'
import 'isomorphic-fetch'
import { getSecret } from '../helpers/aws'
import { IClient } from './IClient'
import { IClientParams } from './IClientParams'

export class Client implements IClient {
  scopes: string[] = ['https://graph.microsoft.com/.default']
  callbackUri = `${process.env.AUTH_CALLBACK_URL}/Outlook/app-key`

  async authorize() {
    const clientConfig = await this.getClientConfig()

    const clientApp = new msal.ConfidentialClientApplication(clientConfig)
    const tokenResponse = await clientApp.acquireTokenByClientCredential({
      scopes: this.scopes
    })
    return { accessToken: tokenResponse.accessToken }
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized client.
   *
   * @param {msal.ConfidentialClientApplication} client Auth client.
   *     client.
   */
  async getClient() {
    const authResponse = await this.authorize()
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, authResponse.accessToken)
      }
    })
    return client
  }

  private async getClientConfig() {
    const credentials = await getSecret('/team/edv/AZURE_CREDENTIALS')
    const parsedCred = JSON.parse(credentials.value) as IClientParams

    return {
      auth: {
        clientId: parsedCred.clientId,
        authority: `https://login.microsoftonline.com/${parsedCred.tenantId}`,
        clientSecret: parsedCred.clientSecret
      },
      system: {
        loggerOptions: {
          loggerCallback(loglevel, message, containsPii) {
            console.log(message)
          },
          piiLoggingEnabled: false,
          logLevel: msal.LogLevel.Verbose,
        }
      }
    }
  }
}