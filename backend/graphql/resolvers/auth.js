const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require("../../models/user");

module.exports = {
    Mutation: {
        createUser: async args => {
            const { email, password } = args.userInput;
            try {
                const existedUser = await User.findOne({ email: email });
                if (existedUser) { throw new Error("User already exists") };
                const user = new User({ email: email, password: await bcrypt.hash(password, 12) });
                const createdUser = await user.save();
                // Need to format, cos mongoose adds some another properties
                return { ...createdUser._doc, password: null, _id: createdUser._id.toString() };
            } catch (err) {
                throw err;
            }
        },
    },
    Query: {
        login: async ({email, password}) => {
            const user = await User.findOne({ email: email });
            if (!user) {
                throw new Error("User does not exist");
            }
            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                throw new Error("Password is incorect!");
            }
            const token = jwt.sign({userId: user.id, email: user.email}, 'somesupersecretkey', {expiresIn: "1h"});
            return { userId: user.id, token: token, tokenExpiration: 1 }
        }
    }
};