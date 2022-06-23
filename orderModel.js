const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create  a order model
let orderSchema = Schema({
	
    customerName: String,
    order: {}
});

module.exports = mongoose.model("Order", orderSchema);
