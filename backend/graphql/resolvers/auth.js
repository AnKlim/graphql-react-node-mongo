const bcrypt = require('bcryptjs');
const User = require("../../models/user");

module.exports = {
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
    }
};