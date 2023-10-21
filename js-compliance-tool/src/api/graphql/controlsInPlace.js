import gql from 'graphql-tag'

export const GET_CONTROLS_IN_PLACE = gql`
  query controlsInPlace {
    controlsInPlace {
      id
      name
    }
  }
`

export const UPDATE_CONTROLS_IN_PLACE = gql`
  mutation updateControlsInPlace($updatedControls: [ControlInPlace]) {
    updateControlsInPlace(updatedControls: $updatedControls) {
      id
    }
  }
`