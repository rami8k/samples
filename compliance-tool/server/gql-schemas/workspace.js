import regulations from '../repository/regulation'
import workspace from '../repository/workspace'
import areas from '../repository/area'
import sections from '../repository/section'
import controlInPlace from '../repository/controlInPlace'
import controlStatus from '../repository/controlStatus'
import risk from '../repository/risk'

export const resolvers = {
  Query: {
    workspaceRegulations: (oot, args, context) => {
      let allRegulations = regulations.findAll()

      let workspaceRegulations = workspace.findAllByUserId(context.auth.user.id)

      workspaceRegulations.forEach(element => {
        var regulation = allRegulations.find(x => x.id === element.id)
        regulation.controlInPlaceId = element.controlInPlaceId
        regulation.controlStatusId = element.controlStatusId
        regulation.riskId = element.riskId
        regulation.comments = element.comments
      });

      return allRegulations
    }
  },
  Mutation: {
    updateWorkspaceRegulations: (root, { updatedRegulations }, context) => {
      updatedRegulations.forEach(x => {
        var regulation = workspace.findOne(context.auth.user.id, x.id)

        if(regulation) {
          regulation.controlInPlaceId = x.controlInPlaceId
          regulation.controlStatusId = x.controlStatusId
          regulation.riskId = x.riskId
          regulation.comments = x.comments
        }
        else {
          x.userId = context.auth.user.id
          workspace.add(x)
        }
      });
    }
  },
  WorkspaceRegulation: {
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
  type WorkspaceRegulation {
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

  input WorkspaceRegulationMutation {
    id: Int!
    controlStatusId: Int
    controlInPlaceId: Int
    riskId: Int
    comments: String
  }

  extend type Query {
    workspaceRegulations: [WorkspaceRegulation] @isAuthenticated(roles: ["user"])
  }

  extend type Mutation {
    updateWorkspaceRegulations(updatedRegulations: [WorkspaceRegulationMutation]): [WorkspaceRegulation] @isAuthenticated(roles: ["user"])
  }
  `;