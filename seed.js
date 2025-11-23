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

// Seed sample products linked with image ObjectIds
async function seedProducts(imageIdMap) {
  const Product = require("./models/Product");

  const products = [
    {
      title: "Cardamom 8mm",
      priceRange: "₹230 - ₹2,150",
      rating: 4.5,
      reviews: 190,
      imageFile: "honeybanner1.jpg",
    },
    {
      title: "Black Pepper",
      priceRange: "₹130 - ₹620",
      rating: 4.3,
      reviews: 134,
      imageFile: "honeybanner2.jpg",
    },
  ];

  for (const productData of products) {
    if (!imageIdMap[productData.imageFile]) {
      console.log(
        `Image for product ${productData.title} not found, skipping product.`
      );
      continue;
    }
    const product = new Product({
      title: productData.title,
      priceRange: productData.priceRange,
      rating: productData.rating,
      reviews: productData.reviews,
      image: imageIdMap[productData.imageFile],
    });

    await product.save();
    console.log(`Seeded product: ${productData.title}`);
  }

  console.log("All products have been seeded.");
}
