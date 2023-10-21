import controlStatus from '../repository/controlStatus'

export const resolvers = {
  Query: {
    controlStatuses: (userId) => {
      return controlStatus.findAll();
    },
    controlStatus: (root, { id }) => {
      return controlStatus.findById(id);
    }
  },
  Mutation: {
    updateControlStatus: (root, { updatedControlStatus }, context) => {
      if(!context.auth.isAuthorized(['admin']))
        throw new Error('Unauthorized')
    }
  }
};


export const typeDefs = `
    type ControlStatus {
      id: Int!                # "!" denotes a required field
      name: String,
    }

    input ControlStatusMutation {
      id: Int!                # "!" denotes a required field
      name: String
    }

    extend type Query {
      controlStatuses(userId: Int): [ControlStatus]    # "[]" means this is a list of channels
      controlStatus(id: Int!): ControlStatus
    }

    extend type Mutation {
      updateControlStatuses(updatedControls: [ControlStatusMutation]): [ControlStatus]  @isAuthenticated(roles: ["admin"])
      updateControlStatus(updatedControl: ControlStatusMutation): ControlStatus  @isAuthenticated(roles: ["admin"])
    }
    `;