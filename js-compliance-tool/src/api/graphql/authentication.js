import gql from 'graphql-tag'

export const SIGNIN_USER_MUTATION = gql`
  mutation SigninUserMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      firstName
      lastName
      email
      roles
      token
    }
  }
`