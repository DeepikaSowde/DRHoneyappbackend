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
    seedImagesFromFolder();
  })
  .catch((error) => console.error("Error connecting to MongoDB Atlas:", error));

async function seedImagesFromFolder() {
  try {
    const imagesDir = "C:/Users/kaviv/DRHoneyapp/dbassets";
    const files = fs.readdirSync(imagesDir);

    // Map of filename -> image ObjectId
    const imageIdMap = {};

    for (const file of files) {
      const filePath = path.join(imagesDir, file);
      const imgData = fs.readFileSync(filePath);
      const ext = path.extname(file).toLowerCase();

      // Determine content type based on file extension
      let contentType = null;
      if (ext === ".jpg" || ext === ".jpeg") {
        contentType = "image/jpeg";
      } else if (ext === ".png") {
        contentType = "image/png";
      } else if (ext === ".gif") {
        contentType = "image/gif";
      } else {
        console.log(`Skipping unsupported file type: ${file}`);
        continue;
      }

      const image = new Image({
        data: imgData,
        contentType: contentType,
      });

      const savedImage = await image.save();
      imageIdMap[file] = savedImage._id;
      console.log(`Seeded image: ${file}, with id: ${savedImage._id}`);
    }

    console.log("All images from dbassets folder have been seeded.");

    // Seed products using the imageIdMap
    await seedProducts(imageIdMap);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding images:", error);
    process.exit(1);
  }
}

// Seed products dynamically from image file names
async function seedProducts(imageIdMap) {
  const Product = require("./models/Product");

  for (const filename in imageIdMap) {
    const title = filename.substring(0, filename.lastIndexOf('.')) || filename;

    const product = new Product({
      title: title,
      priceRange: generatePriceRange(),
      rating: parseFloat(generateRating()),
      reviews: generateReviews(),
      image: imageIdMap[filename],
    });

    await product.save();
    console.log(`Seeded product: ${title}`);
  }

  console.log("All products have been seeded.");
}

// Function to generate random price range string
function generatePriceRange() {
  const min = Math.floor(Math.random() * 100) + 50; // 50 to 149
  const max = min + Math.floor(Math.random() * 1000) + 100; // min + 100 to min + 1099
  return "₹" + min + " - ₹" + max;
}

// Function to generate random rating from 3.5 to 5.0
function generateRating() {
  return (Math.random() * 1.5 + 3.5).toFixed(1);
}

// Function to generate random number of reviews between 10 and 500
function generateReviews() {
  return Math.floor(Math.random() * 491) + 10;
}
