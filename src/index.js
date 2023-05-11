import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import key from './key.json';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://advanced-giraffe-98.hasura.app/v1/graphql',
  cache: new InMemoryCache(),
  headers: { 'x-hasura-admin-secret': key.authToken }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
