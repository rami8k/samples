import controlInPlace from '../repository/controlInPlace'

export const resolvers = {
  Query: {
    controlsInPlace: (userId) => {
      return controlInPlace.findAll();
    },
    controlInPlace: (root, { id }) => {
      return controlInPlace.findById(id);
    }
  },
  Mutation: {
    updateControlInPlace: (root, { updatedControlInPlace }, context) => {
      if(!context.auth.isAuthorized(['admin']))
        throw new Error('Unauthorized')
    }
  }
};


export const typeDefs = `
    type ControlInPlace {
      id: Int!                # "!" denotes a required field
      name: String,
    }

    input ControlInPlaceMutation {
      id: Int!                # "!" denotes a required field
      name: String
    }

    extend type Query {
      controlsInPlace(userId: Int): [ControlInPlace]    # "[]" means this is a list of channels
      controlInPlace(id: Int!): ControlInPlace
    }

    extend type Mutation {
      updateControlsInPlace(updatedControls: [ControlInPlaceMutation]): [ControlInPlace]  @isAuthenticated(roles: ["admin"])
      updateControlInPlace(controlInPlace: ControlInPlaceMutation): ControlInPlace  @isAuthenticated(roles: ["admin"])
    }
    `;