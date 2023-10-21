import gql from 'graphql-tag'

export const GET_RISKS = gql`
  query risks {
    risks {
      id
      name
    }
  }
`

export const UPDATE_RISKS = gql`
  mutation updateRisks($updatedRisks: [Risk]) {
    updateRisks(updatedRisks: $updatedRisks) {
      id
    }
  }
`