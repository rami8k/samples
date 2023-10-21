import gql from 'graphql-tag'

export const GET_AREAS = gql`
  query areas {
    areas {
      id
      sectionId
      name
    }
  }
`

export const UPDATE_AREAS = gql`
  mutation updateAreas($updatedAreas: [Area]) {
    updateAreas(updatedAreas: $updatedAreas) {
      id
    }
  }
`