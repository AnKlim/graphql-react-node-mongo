const Event = require("../../models/event");
const User = require("../../models/user");
const { transformEvent }= require('./merge');

module.exports = {
    Query: {
        events: async () => {
            // Need cos graphQL knows that it runs in async function and wait for complete
            try {
                const findedEvents = await Event.find();
                return findedEvents.map(event => {
                    // Need to format, cos mongoose adds some another properties
                    return transformEvent(event);
                });
            } catch (err) {
                throw new Error("Events not found", err);
            }
        },
    },
    Mutation: {
        createEvent: async (args, req) => {
            if (!req.isAuth) { // middleware folder is-auth file
                throw Error('Not Authenticated!');
            }
            const { title, description, price, date, creator } = args.eventInput;
            try {
                const event = new Event({ title, description, price: +price, date: new Date(date), creator: req.userId });
                const createdEvent = await event.save();
                const user = await User.findById(req.userId);
                if (!user) { throw new Error("User not exists") };
                await user.createdEvents.push(createdEvent);
                await user.save();
                // Need to format, cos mongoose adds some another properties
                return transformEvent(createdEvent);
            } catch (err) {
                throw err;
            }
        }
    }
};