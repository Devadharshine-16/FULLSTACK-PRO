const mongoose = require("mongoose");

const ParcelSchema = new mongoose.Schema({
  trackingId: String,
  senderName: String,
  receiverName: String,
  origin: String,
  destination: String,
  status: { type: String, default: "Pending" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Parcel", ParcelSchema);
