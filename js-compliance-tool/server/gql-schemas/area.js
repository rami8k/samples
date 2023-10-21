import areas from '../repository/area'

export const resolvers = {
  Query: {
    areas: (root, args, context) => {
      return areas.findAll();
    },
    area: (root, { id }, context) => {
      return areas.findById(id);
    }
  },
  Mutation: {
    updateArea: (root, { updatedArea }, context) => {
      if(!context.auth.isAuthorized(['admin']))
        throw new Error('Unauthorized')

      var area = areas.findById(updatedArea.id)
      area.name = updatedArea.name
      return area
    },
    updateAreas: (root, { updatedAreas }, context) => {
      if(!context.auth.isAuthorized(['admin']))
        throw new Error('Unauthorized')

      updatedAreas.forEach(x => {
        var area = areas.findById(x.id)
        area.name = x.name
      })
    }
  }
};


export const typeDefs = `
    type Area {
      id: Int!                # "!" denotes a required field
      sectionId: Int
      name: String
    }

    input AreaMutation {
      id: Int!                # "!" denotes a required field
      sectionId: Int
      name: String
    }

    extend type Query {
      areas(userId: Int): [Area]    # "[]" means this is a list of channels
      area(id: Int!): Area
    }

    extend type Mutation {
      updateArea(updatedArea: AreaMutation): Area @isAuthenticated(roles: ["admin"])
      updateAreas(updatedAreas: [AreaMutation]): [Area]  @isAuthenticated(roles: ["admin"])
    }
    `;