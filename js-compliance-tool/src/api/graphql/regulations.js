import gql from 'graphql-tag'

const regulationFragment = gql`
  fragment regulation on Regulation {
    id
    description
    guidance
    area {
      id
      name
    }
    section {
      id
      name
    }
    controlInPlace {
      id
      name
    }
    controlStatus {
      id
      name
    }
    risk {
      id
      name
    }
    comments
  }
`

export const GET_REGULATIONS = gql`
  query regulations {
    regulations {
      ...regulation
    }
  }
  ${regulationFragment}
`

export const UPDATE_REGULATIONS = gql`
  mutation updateRegulations($updatedRegulations: [RegulationMutation]) {
    updateRegulations(updatedRegulations: $updatedRegulations) {
      ...regulation
    }
  }
  ${regulationFragment}
`