import { ApolloClient } from 'apollo-client'
// import { BatchHttpLink } from 'apollo-link-batch-http'
import {HttpLink} from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink, concat } from 'apollo-link'
// import { onError } from 'apollo-link-error'
import auth from './auth'

// import { ApolloLink } from 'apollo-link'
// import { HttpLink } from 'apollo-link-http'
// import { MeteorAccountsLink } from 'meteor/apollo'

// Create the apollo client
export default function() {
  // const link = ApolloLink.from([
  //   new MeteorAccountsLink(),
  //   new HttpLink({
  //     uri: '/graphql'
  //   })
  // ])

  const httpLink = new HttpLink({uri: `${process.env.GRAPHQL_SERVER}/graphql`})

  // const httpLink = new BatchHttpLink({
  //   uri: `${process.env.GRAPHQL_SERVER}/graphql`
  // })

  const defaultOptions = {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    $loadingKey: 'loading'
  }

  const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        authorization: `Bearer ${auth.getAuthToken()}`,
      }
    })
    return forward(operation)
  })

  // const errorLink = onError(({graphQLErrors, networkError}) => {
  //   console.log(graphQLErrors)
  //   if(graphQLErrors && graphQLErrors[0].extensions.code === 'UNAUTHENTICATED')
  //     auth.logout()
  // })

  return new ApolloClient({
    link: concat(authMiddleware, httpLink),
    cache: new InMemoryCache(),
    ssrForceFetchDelay: 100,
    queryDeduplication: true,
    shouldBatch: true,
    defaultOptions: defaultOptions,
    connectToDevTools: true
  })
}
