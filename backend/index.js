require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Parcel = require('./models/Parcel');

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------- DB CONNECT -----------------------
mongoose.connect("mongodb+srv://root:root@cluster0.k1wedwy.mongodb.net/courierdb")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// ----------------------- AUTH MIDDLEWARE -----------------------
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token provided" });

  const token = header.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = data;
    next();
  });
}

// ----------------------- REGISTER -----------------------
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({ username, password: hashed });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ message: "Registered successfully", token });
});


app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "Invalid username or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid username or password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ message: "Login successful", token });
});

app.post("/api/parcel", auth, async (req, res) => {
  const { senderName, receiverName, origin, destination } = req.body;

  if (!senderName || !receiverName || !origin || !destination)
    return res.status(400).json({ message: "All fields required" });

  const trackingId = "TRK" + Math.floor(Math.random() * 1000000);

  const parcel = await Parcel.create({
    trackingId,
    senderName,
    receiverName,
    origin,
    destination,
    user: req.user.id
  });

  res.json({ message: "Parcel created", parcel });
});

// ----------------------- GET USER PARCELS -----------------------
app.get("/api/parcel", auth, async (req, res) => {
  const parcels = await Parcel.find({ user: req.user.id });
  res.json(parcels);
});

// ----------------------- UPDATE PARCEL -----------------------
app.put("/api/parcel/:trackingId", auth, async (req, res) => {
  const { senderName, receiverName, origin, destination } = req.body;

  const parcel = await Parcel.findOneAndUpdate(
    { trackingId: req.params.trackingId, user: req.user.id },
    { senderName, receiverName, origin, destination },
    { new: true }
  );

  if (!parcel) return res.status(404).json({ message: "Parcel not found or unauthorized" });

  res.json({ message: "Parcel updated successfully", parcel });
});


// ----------------------- DELETE PARCEL -----------------------
app.delete("/api/parcel/:trackingId", auth, async (req, res) => {
  const parcel = await Parcel.findOneAndDelete({ trackingId: req.params.trackingId });
  if (!parcel) return res.status(404).json({ message: "Parcel not found" });

  res.json({ message: "Parcel deleted" });
});


// ----------------------- SERVER -----------------------
app.listen(3000, () => console.log("🚀 Server running on port 3000"));
