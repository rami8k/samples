import gql from 'graphql-tag'

export const GET_CONTROL_STATUSES = gql`
  query controlStatuses {
    controlStatuses {
      id
      name
    }
  }
`

export const UPDATE_CONTROL_STATUSES = gql`
  mutation updateControlStatuses($updatedControls: [ControlInPlace]) {
    updateControlStatuses(updatedControls: $updatedControls) {
      id
    }
  }
`