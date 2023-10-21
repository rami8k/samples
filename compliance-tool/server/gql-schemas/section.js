import sections from '../repository/section'

export const resolvers = {
  Query: {
    sections: () => {
      return sections.findAll();
    },
    section: (root, { id }) => {
      return sections.findById(id);
    },
  },
  Mutation: {
    addSection: (root, args, context) => {
      if(!context.auth.isAuthorized(['admin']))
          throw new Error('Unauthorized')

      return null;
    },
    updateSections: (root, { updatedSections }, context) => {
      return null
    }
  }
}


export const typeDefs = `
    type Section {
      id: Int!                # "!" denotes a required field
      name: String
    }

    input SectionMutation {
      id: Int!                # "!" denotes a required field
      name: String
    }

    extend type Query {
      sections: [Section]
      section(id: Int!): Section
    }

    extend type Mutation {
      addSection(updatedSection: SectionMutation): Section  @isAuthenticated(roles: ["admin"])
      updateSections(updatedSections: [SectionMutation]): [Section]  @isAuthenticated(roles: ["admin"])
    }
    `