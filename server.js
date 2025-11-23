const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Image = require("./models/Image");
const Product = require("./models/Product");
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
    res.contentType(image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint to fetch all products with image URLs instead of embedding image data
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

app.listen(port, () => {
  console.log("Server running on port " + port);
});
