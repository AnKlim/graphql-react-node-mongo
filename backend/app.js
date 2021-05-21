const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]! 
        }

        type RootMutations {
            createEvent(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutations
        }
    `),
    rootValue: {
        events: () => {
            return ['One', 'Two', 'Three'];
        },
        createEvent: args => {
            const eventName = args.name;
            return eventName;
        },
    },
    graphiql: true
}));

app.listen(3000);

// query {
//     events
// }

// mutation {
//     createEvent(name: "ololo")
// }