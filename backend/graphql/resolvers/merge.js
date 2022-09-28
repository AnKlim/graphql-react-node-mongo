const DataLoader = require('dataloader');
const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require('../../helpers/date');

const eventLoader = new DataLoader(eventIds => findEvents(eventIds));

const userLoader = new DataLoader(userIds => User.find({_id: {$in: userIds}}));

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
        const findedUser = await userLoader.load(userId.toString()); // toString coz ids are Object type in mongoDB and may duplicate values 
        return { 
            ...findedUser._doc,
            _id: findedUser._doc._id.toString(),
            createdEvents: () => eventLoader.loadMany(findedUser._doc.createdEvents)
        };
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
        const findedEvent = await eventLoader.load(eventId.toString());
        // return transformEvent(findedEvent); No need coz the same tranformation was done previously during event loader findEvents
        return findedEvent;
    } catch (err) {
        throw err;
    }
}

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
