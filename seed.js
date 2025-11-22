const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Image = require("./models/Image");

// MongoDB Atlas connection URI
const mongoURI =
  "mongodb+srv://yazhmezhiselva_db_user:yazhmezhi@clusterdr.l67rzeh.mongodb.net/?appName=ClusterDR";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    seedImage();
  })
  .catch((error) => console.error("Error connecting to MongoDB Atlas:", error));

async function seedImage() {
  try {
    const imgPath = path.join(__dirname, "../DRHoneyapp/img.jpeg");
    const imgData = fs.readFileSync(imgPath);

    const image = new Image({
      data: imgData,
      contentType: "image/jpeg",
    });

    const savedImage = await image.save();
    console.log("Image seeded with id:", savedImage._id);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding image:", error);
    process.exit(1);
  }
}
