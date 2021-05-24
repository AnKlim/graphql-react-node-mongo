const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require("./models/event");
const User = require("./models/user");

const graphQLSchema = require("./graphql/schema");
const graphQLResolvers = require("./graphql/resolvers");

const app = express();

app.use(bodyParser.json());

// Find all events which ids are equal serched
const findEvents = async eventsIds => {
    try {
        const findedEvents = await Event.find({_id: {$in: eventsIds}});
        return findedEvents.map(event => {
            // Need to format, cos mongoose adds some another properties
            return { ...event._doc, _id: event._doc._id.toString(), creator: findUserById.bind(this, event.creator) }
        });
    } catch (err) {
        throw err;
    }
}

const findUserById = async userId => {
    try {
        const findedUser = await User.findById(userId);
        return { ...findedUser._doc, _id: findedUser._doc._id.toString(), createdEvents: findEvents.bind(this, findedUser._doc.createdEvents) };
    } catch (err) {
        throw err;
    }
}

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