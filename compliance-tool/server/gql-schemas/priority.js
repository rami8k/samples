import {  makeExecutableSchema } from 'graphql-tools'
import priorities from '../repository/priority'

// const priorities = [{
//   id: 1,
//   name: 'low',
// }, {
//   id: 2,
//   name: 'moderate',
// }];

let nextId = 3;

var resolvers = {
  Query: {
    priorities: () => {
      return priorities.findAll();
    },
    priority: (root, { id }) => {
      return priorities.findById(id);
    },
  },
  Mutation: {
    addPriority: (root, args) => {
      const newPriority = { id: nextId++, name: args.name };
      priorities.push(newPriority);
      return newPriority;
    },
  },
};


const typeDefs = `
    type Priority {
      id: Int!                # "!" denotes a required field
      name: String
    }

    type Query {
      priorities: [Priority]    # "[]" means this is a list of channels
      priority(id: Int!): Priority
    }

    type Mutation {
      addPriority(name: String!): Priority  @isAuthenticated(roles: ["admin"])
    }
    `;

exports.priorities = makeExecutableSchema({ typeDefs, resolvers });