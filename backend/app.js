const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');

const graphQLSchema = require("./graphql/schema");
const graphQLResolvers = require("./graphql/resolvers");
const isAuth = require("./middleware/is-auth");

const app = express();

app.use(bodyParser.json());

app.use(isAuth);

app.use('/graphql', graphqlHTTP({
    schema: graphQLSchema,
    rootValue: graphQLResolvers,
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
    }@graphqlreactmongonode.ivihv.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(3000))
    .catch(err => console.log(err));

// query {
//     bookings {
//         createdAt
//         event {
//         title
//         creator {
//             email
//         }
//         }
//     }
// }
    

// mutation {
//     createEvent(eventInput: {title: "A test", description: "Description", price: 123, date: "2021-05-22T06:02:16.291Z"}) {
//         title
//         description
//     }
// }


// mutation {
//     createUser(userInput: {email: "test@test1.com", password: "Test"}) {
//         email
//     		password
//     }
// }

// mutation {
//     createEvent(eventInput: {title: "A test", description: "Description", price: 123, date: "2021-05-22T06:02:16.291Z"}) {
//         title
//         description
//     }
// }