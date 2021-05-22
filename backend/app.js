const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require("./models/event");

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]! 
        }

        type RootMutations {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutations
        }
    `),
    rootValue: {
        events: () => {
            // Need cos graphQL knows that it runs in async function and wait for complete
            return Event.find()
            .then(events => {
                return events.map(event => {
                    return { ...event._doc, _id: event._doc._id.toString() }
                });
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
        },
        createEvent: args => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            });
            // Need cos graphQL knows that it runs in async function and wait for complete
            return event.save()
            .then(result => {
                console.log(result);
                return { ...event._doc, _id: event._doc._id.toString() }
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
        },
    },
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
    }@graphqlreactmongonode.ivihv.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(3000))
    .catch(err => console.log(err));

// query {
//     events {
//         title
//         price
//     }
// }

// mutation {
//     createEvent(eventInput: {title: "A test", description: "Description", price: 123, date: "2021-05-22T06:02:16.291Z"}) {
//         title
//         description
//     }
// }
