const Event = require("../../models/event");
const Booking = require("../../models/booking");
const { transformEvent, transformBooking }= require('./merge');

module.exports = {
    bookings: async () => {
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
            return transformBooking(createdBooking)
        } catch (err) {
            throw err;
        }
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEvent(booking.event);
            await Booking.deleteOne({ _id: args.bookingId });
            return event;
        } catch (err) {
            throw err;
        }
    }
};