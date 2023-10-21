import risk from '../repository/risk'

export const resolvers = {
  Query: {
    risks: (userId) => {
      return risk.findAll();
    },
    risk: (root, { id }) => {
      return risk.findById(id);
    }
  },
  Mutation: {
    updateRisk: (root, { updatedRisk }, context) => {
      return null
    }
  }
};


export const typeDefs = `
    type Risk {
      id: Int!                # "!" denotes a required field
      name: String,
    }

    input RiskMutation {
      id: Int!                # "!" denotes a required field
      name: String
    }

    extend type Query {
      risks(userId: Int): [Risk]    # "[]" means this is a list of channels
      risk(id: Int!): Risk
    }

    extend type Mutation {
      updateRisk(risk: RiskMutation): Risk  @isAuthenticated(roles: ["admin"])
      updateRisks(updatedRisks: [RiskMutation]): [Risk]  @isAuthenticated(roles: ["admin"])
    }
    `;