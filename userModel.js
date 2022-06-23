const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create a user model
let userSchema = Schema({
	
    username: String,
    password: String,
    privacy: Boolean,
    orderhistory: []
});


module.exports = mongoose.model("User", userSchema);
