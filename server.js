const express = require("express")
const app = express()
const path = require("path")
const multer = require("multer")
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 8000

const mongoose = require("mongoose")

const CONNECTION_STRING =
`mongodb+srv://dbUser:C4-credsupige@cluster0.lbf87.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
`

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let Driver = require("./models/driver");
let MenuItem = require("./models/menuitem");
let Order = require("./models/order");


/*	Database collection definitions

		orders_collection
		drivers_collection
		menuitems_collection
*/

// Connect to database
const connectDB = async () => {
    try {
        console.log(`Attempting to connect to database.`);
        
        mongoose.connect(CONNECTION_STRING)
        .then(() => console.log("MongoDB connected!"))
        .catch(err => console.log(err))

    } catch (error) {
        console.error(error.message);
    }
}


app.get("/", (req, res) => {
	res.redirect("/menu");
});


app.get("/menu", async (req, res) => {
	try {
		const menuItems = await MenuItem.find();
		res.render("restaurant/menu", { menuItems });
	} catch (err) {
		console.error("Error fetching menu item:", err);
		res.status(500).send("Internal Server Error");
	}
});


app.get("/order", async (req, res) => {
	try {
		const menuItems = await MenuItem.find();
		res.render("order", { menuItems });
	} catch (err) {
		console.error("Error fetching menu items:", err);
		res.status(500).send("Internal Server Error");
	}
});

app.post("/order", async (req, res) => {
	const { customerName, deliveryAddress, items } = req.body;
	try {
		const order = new Order({
			customerName,
			deliveryAddress,
			itemsOrdered: [items]
		});
  
	  	await order.save();
	  	res.render("order_confirmation", { order });
	} catch (err) {
	  	console.error("Error saving order:", err);
	  	res.status(500).send("Internal Server Error");
	}
});


app.get("/order/status", async (req, res) => {
	const { orderId } = req.query;
	try {
		const order = await Order.findById(orderId);
		if (!order) {
		res.render("orderStatus", { error: "Order not found" });
		} else {
		res.render("orderStatus", { status: order.status });
		}
	} catch (err) {
		console.error("Error fetching order status:", err);
		res.status(500).send("Internal Server Error");
	}
});  


app.get("/orders", async (req, res) => {
	try {
	  	const orders = await Order.find();
		res.render("orders", { orders });
	} catch (err) {
		console.error("Error fetching orders:", err);
		res.status(500).send("Internal Server Error");
	}
});


app.post("/processing/updateOrder", async (req, res) => {
	const { orderId, status } = req.body;
	try {
	  	const order = await Order.findById(orderId);
	  	if (!order) {
			return res.status(404).send("Order not found");
	  	}
	  	order.status = status;
	  	await order.save();
	  	res.redirect("processing/orders");
	} catch (err) {
	  	console.error("Error updating order:", err);
	  	res.status(500).send("Internal Server Error");
	}
});
  
  
app.post("/driver/register", async (req, res) => {
	const { username, password, fullName, vehicleModel, color, licensePlate } = req.body;
	try {
		const existingDriver = await Driver.findOne({ username });
		if (existingDriver) {
			return res.status(400).send("Username already taken");
		}
	  
		const driver = new Driver({
			username,
			password,
			fullName,
			vehicleModel,
			color,
			licensePlate
		});
  
		await driver.save();
		res.redirect("/driver/login");
	} catch (err) {
		console.error("Error registering driver:", err);
		res.status(500).send("Internal Server Error");
	}
});
  

app.post("/driver/login", async (req, res) => {
	const { username, password } = req.body;
	try {
		const driver = await Driver.findOne({ username });
		if (!driver) {
			return res.status(404).send("Driver not found");
		}
  
		if (driver.password !== password) {
			return res.status(400).send("Incorrect password");
		}
  
		res.redirect("/driver/deliveries");
	} catch (err) {
		console.error("Error during login:", err);
		res.status(500).send("Internal Server Error");
	}
});


app.get("/driver/deliveries", async (req, res) => {
	try {
		const deliveries = await Order.find({ status: "READY FOR DELIVERY" });
		res.render("driver/delivery", { deliveries });
	} catch (err) {
		console.error("Error fetching deliveries:", err);
		res.status(500).send("Internal Server Error");
	}
});


app.post("/driver/updateDeliveryStatus", upload.single('photo'), async (req, res) => {
	const { orderId, status } = req.body;
	const photo = req.file ? req.file.path : null;
  
	try {
		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).send("Order not found");
		}
  
		order.status = status;
		if (photo) {
			order.deliveryPhoto = photo;
		}
		await order.save();
  
		res.redirect("/driver/deliveries");
	} catch (err) {
		console.error("Error updating delivery status:", err);
		res.status(500).send("Internal Server Error");
	}
});


const onServerStart = () => {
	console.log(`Server running at http://localhost:${PORT}`);
	connectDB();
}

app.listen(PORT, onServerStart);