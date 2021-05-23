const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require("./models/event");
const User = require("./models/user");

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

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]! 
        }

        type RootMutations {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutations
        }
    `),
    rootValue: {
        events: async () => {
            // Need cos graphQL knows that it runs in async function and wait for complete
            try {
                const findedEvents = await Event.find();
                return findedEvents.map(event => {
                    // Need to format, cos mongoose adds some another properties
                    return { ...event._doc, _id: event._doc._id.toString() }
                });
            } catch (err) {
                throw new Error("Events not found", err);
            }
        },
        createEvent: async args => {
            const { title, description, price, date, creator } = args.eventInput;
            try {
                const event = new Event({title, description, price: +price, date: new Date(date), creator: "60aa3c3d3d50231e5462c8f3"});
                const createdEvent = await event.save();
                const user = await User.findById("60aa3c3d3d50231e5462c8f3");
                if (!user) { throw new Error("User not exists") };
                await user.createdEvents.push(createdEvent);
                await user.save();
                // Need to format, cos mongoose adds some another properties
                return { ...createdEvent._doc, _id: createdEvent._doc._id.toString() };
            } catch (err) {
                throw err;
            }
        },
        createUser: async args => {
            const { email, password } = args.userInput;
            try {
                console.log(email);
                const existedUser = await User.findOne({email: email});
                console.log(existedUser);
                if (existedUser) { throw new Error("User already exists") };
                const user = new User({ email: email, password: await bcrypt.hash(password, 12) });
                const createdUser = await user.save();
                // Need to format, cos mongoose adds some another properties
                return { ...createdUser._doc, password: null, _id: createdUser._doc._id.toString() };
            } catch (err) {
                throw err;
            }
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