const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: { type: Schema.Types.ObjectId, ref: "Listing" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalPrice: Number,
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    stripeSessionId: String,
});

module.exports = mongoose.model("Booking", bookingSchema);