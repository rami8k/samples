import { sign, verify } from 'jsonwebtoken'
import { getSecret } from '../helpers/aws'

export class AuthService {
  async register(appKey: string, email: string): Promise<string> {
    const secret = await getSecret('/BU/all/JWT_SECRET')
    const token = sign({ appKey, email }, secret.value, {
      expiresIn: '1y'
    })
    return token
  }

  async verify(token): Promise<any> {
    const secret = await getSecret('/BU/all/JWT_SECRET')

    return await verify(token.split(' ')[1], secret.value, (err, decoded) => {
      if (err) {
        throw 'invalid token'
      }
      
      return decoded
    })
  }
}