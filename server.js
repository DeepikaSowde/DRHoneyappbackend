const express = require("express");
const mongoose = require("mongoose");
const Image = require("./models/Image");
const app = express();
const port = 5000;

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
