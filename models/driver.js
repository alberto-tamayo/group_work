const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	fullName: { type: String, required: true },
	vehicleModel: { type: String, required: true },
	vehicleColor: { type: String, required: true },
	licensePlate: { type: String, required: true }
})

let Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;