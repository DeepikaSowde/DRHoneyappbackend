const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: { type: String, required: true },
  priceRange: { type: String },
  rating: { type: Number },
  reviews: { type: Number },
  image: { type: Schema.Types.ObjectId, ref: "Image" },
});

module.exports = mongoose.model("Product", productSchema);
