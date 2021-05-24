const bcrypt = require('bcryptjs');
const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");
const user = require('../../models/user');

// Find all events which ids are equal serched
const findEvents = async eventsIds => {
    try {
        const findedEvents = await Event.find({ _id: { $in: eventsIds } });
        return findedEvents.map(event => {
            // Need to format, cos mongoose adds some another properties
            return { ...event._doc, _id: event._doc._id.toString(), creator: findUserById.bind(this, event.creator) }
        });
    } catch (err) {
        throw err;
    }
}

const singleEvent = async eventId => {
    try {
        const findedEvent = await Event.findById(eventId);
        return { ...findedEvent._doc, _id: findedEvent._doc._id.toString(), creator: findUserById.bind(this, findedEvent.creator) };
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

module.exports = {
    bookings: async () => {
        // Need cos graphQL knows that it runs in async function and wait for complete
        try {
            const findedBookings = await Booking.find();
            return findedBookings.map(booking => {
                // Need to format, cos mongoose adds some another properties
                return {
                    ...booking._doc, _id: booking._doc._id.toString(),
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                }
            });
        } catch (err) {
            throw new Error("Events not found", err);
        }
    },
    events: async () => {
        // Need cos graphQL knows that it runs in async function and wait for complete
        try {
            const findedEvents = await Event.find();
            return findedEvents.map(event => {
                // Need to format, cos mongoose adds some another properties
                return { ...event._doc, _id: event._doc._id.toString(), creator: findUserById.bind(this, event._doc.creator) };
            });
        } catch (err) {
            throw new Error("Events not found", err);
        }
    },
    createEvent: async args => {
        const { title, description, price, date, creator } = args.eventInput;
        try {
            const event = new Event({ title, description, price: +price, date: new Date(date), creator: "60aa3c3d3d50231e5462c8f3" });
            const createdEvent = await event.save();
            const user = await User.findById("60aa3c3d3d50231e5462c8f3");
            if (!user) { throw new Error("User not exists") };
            await user.createdEvents.push(createdEvent);
            await user.save();
            // Need to format, cos mongoose adds some another properties
            return { ...createdEvent._doc, _id: createdEvent._doc._id.toString(), creator: findUserById.bind(this, createdEvent._doc.creator) };
        } catch (err) {
            throw err;
        }
    },
    createUser: async args => {
        const { email, password } = args.userInput;
        try {
            const existedUser = await User.findOne({ email: email });
            if (existedUser) { throw new Error("User already exists") };
            const user = new User({ email: email, password: await bcrypt.hash(password, 12) });
            const createdUser = await user.save();
            // Need to format, cos mongoose adds some another properties
            return { ...createdUser._doc, password: null, _id: createdUser._doc._id.toString(), createdEvents: findEvents.bind(this, createdUser._doc.createdEvents) };
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async args => {
        try {
            const fetchedEvent = await Event.findOne({ _id: args.eventId });
            const booking = new Booking({
                event: fetchedEvent,
                user: "60aa3c3d3d50231e5462c8f3"
                // createdAt, updatedAt will be added by mongoose
            });
            const createdBooking = await booking.save();
            // Need to format, cos mongoose adds some another properties
            return {
                ...createdBooking._doc, _id: createdBooking._doc._id.toString(),
                user: user.bind(this, booking._doc.user),
                event: singleEvent.bind(this, booking._doc.event),
                createdAt: new Date(createdBooking._doc.createdAt).toISOString(),
                updatedAt: new Date(createdBooking._doc.updatedAt).toISOString()
            }
        } catch (err) {
            throw err;
        }
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = { ...booking.event._doc, _id: booking._doc._id.toString(), creator: findUserById.bind(this, booking.event._doc.creator) };
            await Booking.deleteOne({ _id: args.bookingId });
            return event;
        } catch (err) {
            throw err;
        }
    }
};