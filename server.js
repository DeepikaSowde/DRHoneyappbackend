const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Image = require(path.join(__dirname, "models", "Image"));
const Product = require(path.join(__dirname, "models", "Product"));
const Order = require(path.join(__dirname, "models", "Order"));
const app = express();
const port = 5000;

app.use(cors()); // Enable CORS for all origins

// Log the contents of models directory to verify files are present on startup
const modelsPath = path.join(__dirname, "models");
fs.readdir(modelsPath, (err, files) => {
  if (err) {
    console.error("Error reading models directory:", err);
  } else {
    console.log("Models directory contents:", files);
  }
});

// MongoDB Atlas connection URI
const mongoURI =
  "mongodb+srv://yazhmezhiselva_db_user:yazhmezhi@clusterdr.l67rzeh.mongodb.net/?appName=ClusterDR";

// Connect to MongoDB Atlas
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error("Error connecting to MongoDB Atlas:", error));

// Endpoint to fetch image by id
app.get("/image/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).send("Image not found");
    }
    res.set({
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=31536000',
      'Content-Disposition': `inline; filename="${req.params.id}${image.contentType.split('/')[1] ? '.' + image.contentType.split('/')[1] : ''}"`
    });
    res.send(image.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint to fetch all products with image URLs and category
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find().populate("image");

    // Base URL for image access
    const baseUrl = "https://drhoneyappbackend.onrender.com";

    // Map products to replace image object with image URL
    const productsWithImageUrl = products.map((product) => {
      const productObj = product.toObject();
      if (productObj.image && productObj.image._id) {
        productObj.image = baseUrl + "/image/" + productObj.image._id;
      } else {
        productObj.image = null;
      }
      return productObj;
    });

    res.json(productsWithImageUrl);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint to create a new order
app.post("/create-order", express.json(), async (req, res) => {
  try {
    const { orderId, items, totalAmount, customerInfo } = req.body;

    if (!orderId || !items || !totalAmount) {
      return res.status(400).json({ error: "Missing required fields: orderId, items, totalAmount" });
    }

    const order = new Order({
      orderId,
      items,
      totalAmount,
      customerInfo: customerInfo || {},
      status: 'pending'
    });

    await order.save();
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error creating order:", error);
    if (error.code === 11000) {
      res.status(409).json({ error: "Order ID already exists" });
    } else {
      res.status(500).json({ error: "Failed to create order" });
    }
  }
});

// Endpoint to verify payment and update order status
app.post("/verify-payment", express.json(), async (req, res) => {
  try {
    const { orderId, paymentId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: "Missing required fields: orderId, status" });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    if (paymentId) {
      order.paymentId = paymentId;
    }
    order.updatedAt = new Date();

    await order.save();
    res.json({ message: "Payment status updated successfully", order });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Endpoint to get order status
app.get("/order/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

app.listen(port, () => {
  console.log("Server running on port " + port);
});
