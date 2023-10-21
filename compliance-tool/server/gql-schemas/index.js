import { makeExecutableSchema } from 'graphql-tools'

import { merge } from 'lodash';

import { directiveResolvers, typeDefs as authenticationTypes, resolvers as authenticationResolvers } from './authentication'
import { typeDefs as companyTypes, resolvers as companyResolvers } from './company'
import { typeDefs as regulationTypes, resolvers as regulationResolvers } from './regulation'
import { typeDefs as workspaceTypes, resolvers as workspaceResolvers } from './workspace'
import { typeDefs as sectionTypes, resolvers as sectionResolvers } from './section'
import { typeDefs as areaTypes, resolvers as areaResolvers } from './area'
import { typeDefs as controlInPlaceTypes, resolvers as controlInPlaceResolvers } from './controlInPlace'
import { typeDefs as controlStatusTypes, resolvers as controlStatusResolvers } from './controlStatus'
import { typeDefs as riskTypes, resolvers as riskResolvers } from './risk'

// import { typeDefs as priorirtyTypes, resolvers as priorityResolvers } from './priority'

// If you had Query fields not associated with a
// specific type you could put them here
const Query = `
  type Query {
    _empty: String
  }
`

const Mutation = `
  type Mutation {
    _empty: String
  }
`

const resolvers = {
};

export const schemas = makeExecutableSchema({
  typeDefs: [ Query, Mutation, authenticationTypes, companyTypes, regulationTypes, workspaceTypes, areaTypes, sectionTypes, controlInPlaceTypes, controlStatusTypes, riskTypes ],
  resolvers: merge(resolvers, authenticationResolvers, companyResolvers,regulationResolvers, workspaceResolvers, areaResolvers, sectionResolvers, controlInPlaceResolvers, controlStatusResolvers, riskResolvers),
  directiveResolvers
})