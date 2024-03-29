const Event = require("../../models/event");
const Booking = require("../../models/booking");
const { transformEvent, transformBooking }= require('./merge');

module.exports = {
    Query: {
        bookings: async (parent, args, context, info) => {
            if (!context.authScope.isAuth) { // middleware folder is-auth file
                throw Error('Not Authenticated!');
            }
            // Need cos graphQL knows that it runs in async function and wait for complete
            try {
                const findedBookings = await Booking.find();
                return findedBookings.map(booking => {
                    // Need to format, cos mongoose adds some another properties
                    return transformBooking(booking);
                });
            } catch (err) {
                throw new Error("Events not found", err);
            }
        }
    },
    Mutation: {
        bookEvent: async (parent, args, context, info) => {
            if (!context.authScope.isAuth) { // middleware folder is-auth file
                throw Error('Not Authenticated!');
            }
            try {
                const fetchedEvent = await Event.findOne({ _id: args.eventId });
                const booking = new Booking({
                    event: fetchedEvent._id,
                    user: context.authScope.userId
                    // createdAt, updatedAt will be added by mongoose
                });
                const createdBooking = await booking.save();
                // Need to format, cos mongoose adds some another properties
                return transformBooking(createdBooking)
            } catch (err) {
                throw err;
            }
        },
        cancelBooking: async (parent, args, context, info) => {
            if (!context.authScope.isAuth) { // middleware folder is-auth file
                throw Error('Not Authenticated!');
            }
            try {
                const booking = await Booking.findById(args.bookingId).populate('event');
                const event = transformEvent(booking.event);
                await Booking.deleteOne({ _id: args.bookingId });
                return event;
            } catch (err) {
                throw err;
            }
        }
    }
};