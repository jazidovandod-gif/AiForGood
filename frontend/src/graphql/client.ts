import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { environment } from '../config/environment';

const httpLink = createHttpLink({
  uri: environment.graphql.uri,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('access_token');
  const deviceId = localStorage.getItem('device_id');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'X-Device-ID': deviceId || '',
    }
  };
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  }
});
