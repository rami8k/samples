import companies from '../repository/company'

export const resolvers = {
  Query: {
    companies: (root, args, context) => {
      return companies.findAll();
    },
    company: (root, { id }, context) => {
      return companies.findById(id);
    }
  },
  Mutation: {
    updateCompany: (root, { updatedCompany }, context) => {
      if(!context.auth.isAuthorized(['admin']))
        throw new Error('Unauthorized')

      var company = companies.findById(updatedCompany.id)
      company.name = updatedCompany.name
      return company
    },
    updateCompanies: (root, { updatedCompanies }, context) => {
      if(!context.auth.isAuthorized(['admin']))
        throw new Error('Unauthorized')

      updatedCompanies.forEach(x => {
        var company = companies.findById(x.id)

        if(company)
          company.name = x.name
        else
          companies.add(x)
      })

      return companies.findAll()
    },
    deleteCompany: (root, { id }, context) => {
      if(!context.auth.isAuthorized(['admin']))
        throw new Error('Unauthorized')

      companies.delete(id)

      return id
    }
  }
};


export const typeDefs = `
    type Company {
      id: Int!                # "!" denotes a required field
      name: String
    }

    input CompanyMutation {
      id: Int!                # "!" denotes a required field
      name: String
    }

    extend type Query {
      companies: [Company]    # "[]" means this is a list of channels
      company(id: Int!): Area
    }

    extend type Mutation {
      updateCompany(updatedCompany: CompanyMutation): Company  @isAuthenticated(roles: ["admin"])
      updateCompanies(updatedCompanies: [CompanyMutation]): [Company]  @isAuthenticated(roles: ["admin"])
      deleteCompany(id: Int!): Int  @isAuthenticated(roles: ["admin"])
    }
    `;