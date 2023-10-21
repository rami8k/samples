import { AuthenticationError } from 'apollo-server-express'
import jsonwebtoken from 'jsonwebtoken'

import users from '../repository/user'


export const resolvers = {
  Query: {
    currentUser: (root, args, context) => {
      return context.auth.user
    }
  },
  Mutation: {
    login: (root, { email, password }) => {
      const user = users.findByEmail(email)

      if (!user) {
        throw new Error('No user with that email')
      }

      const valid = user.password === password

      if (!valid) {
        throw new Error('Incorrect password')
      }

      // return json web token
      return {
        firstName: user.firstName, 
        lastName: user.lastName,
        email: user.email,
        roles: user.roles,
        token: jsonwebtoken.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
      }
    },
    createUser: (root, { email, password }) => {
      const existingUser = users.findByEmail({ email });

      if (existingUser) {
        throw new Error('Email already used');
      }
      
      const hash = 'bcrypt.hash(password, 10);'
      users.insert({
        email,
        password: hash,
      });

      const user = users.findByEmail({ email });
      
      user.token = jsonwebtoken.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })

      return user; 
    }
  }
}

export const directiveResolvers = {
  isAuthenticated: (next, source, { roles }, context) => {
    // console.log(roles)
    // console.log(context)

    if(!context.auth.user) {
      console.log('not authenticated')
      throw new AuthenticationError('Authentication token is invalid or expired')
    }

    if(!context.auth.isAuthorized(roles)) {
      console.log('not isAuthorized')
      throw new AuthenticationError('Unauthorized')
    }

    return next()
  }
}


export const typeDefs = `
  directive @isAuthenticated(roles: [String]) on QUERY | FIELD | FIELD_DEFINITION

  type User {
    firstName: String
    lastName: String
    email: String
    roles: [String]
    token: String
  }

  extend type Mutation {
    createUser(email: String, password: String): User @isAuthenticated(roles: ["admin"])
    login(email: String, password: String): User
  }
  
  extend type Query {
    currentUser: User
  }
  `