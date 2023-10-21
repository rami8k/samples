import gql from 'graphql-tag'

const workspaceRegulationFragment = gql`
  fragment regulation on WorkspaceRegulation {
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

export const GET_WORKSPACE_REGULATIONS = gql`
  query workspaceRegulations {
    workspaceRegulations {
      ...regulation
    }
  }
  ${workspaceRegulationFragment}
`

export const UPDATE_WORKSPACE_REGULATIONS = gql`
  mutation updateWorkspaceRegulations($updatedRegulations: [WorkspaceRegulationMutation]) {
    updateWorkspaceRegulations(updatedRegulations: $updatedRegulations) {
      ...regulation
    }
  }
  ${workspaceRegulationFragment}
`