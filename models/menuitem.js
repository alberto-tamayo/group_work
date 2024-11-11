const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String, required: true },
	image: { type: String, required: true },
	price: { type: Number, required: true }
})

let MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;