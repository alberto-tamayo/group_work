const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
	customerName: { type: String, required: true },
	deliveryAddress: { type: String, required: true },
	itemsOrdered: { type: [String], required: true },
	dateTime: { type: Date, default: Date.now },
	status: { 
	  type: String, 
	  enum: ['RECEIVED', 'READY FOR DELIVERY', 'IN TRANSIT', 'DELIVERED'], 
	  default: 'RECEIVED', 
	  required: true 
	}
})

let Order = mongoose.model("Order", orderSchema);

module.exports = Order;