const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");


const categories = [
  "Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", 
  "Amazing Pools", "Camping", "Farms", "Arctic", "Luxury", "Budget"
];

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String
  },
  price: Number,
  location: String,
  country: String,
  category: {
    type: String,
    enum: categories,
    required: true,
    default: "Trending"
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;