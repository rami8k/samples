import { IClientParams } from './IClientParams'

export interface IClient {
  scopes: string[]
  callbackUri: string

  getAuthUrl?(): Promise<string>
  authorize(code: string, args?: any)
  reAuthorize?(refereshToken: string)
  getClient(credentials?: any)
}