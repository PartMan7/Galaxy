import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
	link: new HttpLink({
		uri: 'https://api.github.com/graphql',
		headers: {
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
		},
	}),
	cache: new InMemoryCache(),
});

export default client;
