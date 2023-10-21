import regulations from '../repository/regulation'
import areas from '../repository/area'
import sections from '../repository/section'
import controlInPlace from '../repository/controlInPlace'
import controlStatus from '../repository/controlStatus'
import risk from '../repository/risk'

export const resolvers = {
  Query: {
    regulations: () => {
      return regulations.findAll();
    },
    regulation: (root, { id }) => {
      return regulations.findById(id);
    }
  },
  Mutation: {
    updateRegulations: (root, { updatedRegulations }, context) => {
      if(!context.auth.isAuthorized(['admin']))
        throw new Error('Unauthorized')

      updatedRegulations.forEach(x => {
        var regulation = regulations.findById(x.id)
        regulation.controlInPlaceId = x.controlInPlaceId
        regulation.controlStatusId = x.controlStatusId
        regulation.riskId = x.riskId
        regulation.comments = x.comments
      });
    }
  },
  Regulation: {
    area({ areaId }) {
      return areas.findById(areaId)
    },
    section({ sectionId }) {
      return sections.findById(sectionId)
    },
    controlStatus({ controlStatusId }) {
      return controlStatus.findById(controlStatusId)
    },
    controlInPlace({ controlInPlaceId }) {
      return controlInPlace.findById(controlInPlaceId)
    },
    risk({ riskId }) {
      return risk.findById(riskId)
    }
  }
};


export const typeDefs = `
  type Regulation {
    id: Int!                # "!" denotes a required field
    description: String
    guidance: String
    area: Area
    section: Section
    controlStatus: ControlStatus
    controlInPlace: ControlInPlace
    risk: Risk
    comments: String
  }

  input RegulationMutation {
    id: Int!                # "!" denotes a required field
    controlStatusId: Int
    controlInPlaceId: Int
    riskId: Int
    comments: String
  }

  type ReulationMutation {
    id: Int!                # "!" denotes a required field
    controlStatusId: Int
    controlInPlaceId: Int
    riskId: Int
    comments: String
  }

  extend type Query {
    regulations: [Regulation]    # "[]" means this is a list of channels
    regulation(id: Int!): Regulation
  }

  extend type Mutation {
    updateRegulations(updatedRegulations: [RegulationMutation]): [Regulation]  @isAuthenticated(roles: ["admin"])
  }
  `;