const mongoose = require("mongoose");

const passportLocalMongoose = require("passport-local-mongoose").default;

console.log("passportLocalMongoose type:", typeof passportLocalMongoose);


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    }
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
});

module.exports = mongoose.model("User", userSchema);
