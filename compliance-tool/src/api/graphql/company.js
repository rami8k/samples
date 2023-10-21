import gql from 'graphql-tag'

export const GET_COMPANIES = gql`
  query companies {
    companies {
      id
      name
    }
  }
`

export const UPDATE_COMPANIES = gql`
  mutation updateCompanies($updatedCompanies: [CompanyMutation]) {
    updateCompanies(updatedCompanies: $updatedCompanies) {
      id
    }
  }
`

export const DELETE_COMPANY = gql`
  mutation deleteCompany($id: Int!) {
    deleteCompany(id: $id)
  }
`