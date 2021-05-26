const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require('../../helpers/date');

const transformEvent = event => {
    return { ...event._doc, _id: event._doc._id.toString(), date: dateToString(event._doc.date), creator: findUserById.bind(this, event.creator) };
};

const transformBooking = booking => {
    return {
        ...booking._doc, _id: booking._doc._id.toString(),
        user: findUserById.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    };
};

const findUserById = async userId => {
    try {
        const findedUser = await User.findById(userId);
        return { ...findedUser._doc, _id: findedUser._doc._id.toString(), createdEvents: findEvents.bind(this, findedUser._doc.createdEvents) };
    } catch (err) {
        throw err;
    }
}

// Find all events which ids are equal serched
const findEvents = async eventsIds => {
    try {
        const findedEvents = await Event.find({ _id: { $in: eventsIds } });
        return findedEvents.map(event => {
            // Need to format, cos mongoose adds some another properties
            return transformEvent(event);
        });
    } catch (err) {
        throw err;
    }
}

const singleEvent = async eventId => {
    try {
        const findedEvent = await Event.findById(eventId);
        return transformEvent(findedEvent);
    } catch (err) {
        throw err;
    }
}

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
