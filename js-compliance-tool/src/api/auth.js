// import jsonwebtoken from 'jsonwebtoken'

const USER_INFO = 'user-info'
const SERVER_AUTH_TOKEN = 'gdpr-server-auth-token'
const SERVER_AUTH_TOKEN_EXPIRY = 'gdpr-server-auth-token-expiry'

function isAuthTokenExpired() {
  const token = localStorage.getItem(SERVER_AUTH_TOKEN)

  if (!token) {
    return null
  }

  const expires = localStorage.getItem(SERVER_AUTH_TOKEN_EXPIRY)

  if (!expires) {
    return null
  }

  return Date.now() > new Date(parseInt(expires))
}

function hasAuthToken() {
  return !!getAuthToken()
}

function getAuthToken() {
  const token = localStorage.getItem(SERVER_AUTH_TOKEN)

  if (!token) {
    return null
  }

  if (!isAuthTokenExpired()) {
    return token
  }
}

function logout() {
  localStorage.removeItem(USER_INFO)
  localStorage.removeItem(SERVER_AUTH_TOKEN)
}

export default {
  get user() {
    return JSON.parse(localStorage.getItem(USER_INFO))
  },
  set user(data) {
    data.loginDate = new Date()
    localStorage.setItem(USER_INFO, JSON.stringify(data))
    localStorage.setItem(SERVER_AUTH_TOKEN, data.token)
  },

  intialize() {
    const token = localStorage.getItem(SERVER_AUTH_TOKEN)

    if (token) {
      // this.user = jsonwebtoken.decode(token)
    }
  },

  isLoggedIn() {
    return !!hasAuthToken()
  },
  isAdmin() {
    return this.user ? this.user.roles.includes('admin') : false
  },
  logout,
  isAuthTokenExpired,
  getAuthToken
}