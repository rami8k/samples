import gql from 'graphql-tag'

export const GET_SECTIONS = gql`
  query sections {
    sections {
      id
      name
    }
  }
`

export const UPDATE_SECTIONS = gql`
  mutation updateSections($updatedSections: [Section]) {
    updateSections(updatedSections: $updatedSections) {
      id
    }
  }
`