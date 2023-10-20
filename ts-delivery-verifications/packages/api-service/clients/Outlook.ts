import * as msal from '@azure/msal-node'
import * as graph from '@microsoft/microsoft-graph-client'
import 'isomorphic-fetch'
import { getSecret } from '../helpers/aws'
import { IClient } from './IClient'
import { IClientParams } from './IClientParams'

export class Client implements IClient {
  scopes: string[] = ['mail.readwrite']
  callbackUri = `${process.env.AUTH_CALLBACK_URL}/Outlook/app-key`

  async getAuthUrl() {
    const clientConfig = await this.getClientConfig()
    const clientApp = new msal.ConfidentialClientApplication(clientConfig)

    const urlParameters = {
      scopes: this.scopes,
      redirectUri: this.callbackUri
    }
    return await clientApp.getAuthCodeUrl(urlParameters)
  }

  async authorize(code: string) {
    const clientConfig = await this.getClientConfig()
    const clientApp = new msal.ConfidentialClientApplication(clientConfig)

    const token = await clientApp.acquireTokenByCode({ 
      code: code,
      scopes: this.scopes,
      redirectUri: this.callbackUri
    })
    return { scopes: token.scopes, accessToken: token.accessToken }
  }

  async reAuthorize(refreshToken: string) {
    const refreshTokenRequest = {
      refreshToken: refreshToken,
      scopes: ["user.read"],
    }
    
    const clientConfig = await this.getClientConfig()
    const clientApp = new msal.ConfidentialClientApplication(clientConfig)
    
    const token = await clientApp.acquireTokenByRefreshToken(refreshTokenRequest)
    return { scopes: token.scopes, accessToken: token.accessToken }
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized client.
   *
   * @param {msal.ConfidentialClientApplication} client Auth client.
   *     client.
   */
  async getClient(credentials: any) {
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, credentials.accessToken)
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
        authority: 'https://login.microsoftonline.com/common/',
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