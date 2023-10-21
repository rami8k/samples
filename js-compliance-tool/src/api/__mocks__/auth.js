export default {
  get user() {
    return {
      id: 1,
      firstName: 'first name',
      lastName: 'last name',
      email: 'email',
      roles: ['user'],
      token: 'token'
    }
  },
  isLoggedIn() {
    return true
  },
  isAdmin() {
    return false
  }
}