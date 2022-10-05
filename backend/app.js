const { ApolloServer } = require("apollo-server");
const mongoose = require('mongoose');

const graphQLSchema = require("./graphql/schema");
const graphQLResolvers = require("./graphql/resolvers");
const isAuth = require("./middleware/is-auth");

const server = new ApolloServer({
    typeDefs: graphQLSchema,
    resolvers: graphQLResolvers,
    context: ({ req }) => ({
        authScope: isAuth(req)
    }),
});
      
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
    }@graphqlreactmongonode.ivihv.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => server.listen().then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    }))
    .catch(err => console.log(err));
