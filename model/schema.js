const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  phone_number: { type: String, required: true, unique: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  user_type: { type: String, enum: ["Passenger", "Driver"], required: true, default: "Passenger" },
  created_at: { type: Date, default: Date.now },
  verification: { type: String, enum: ["Yes", "No"], required: true,default: "No" },
  overall_ratings: { type: Number, min: 0, max: 5, default: 0 },
  otp: { type: Number }
});

const driversSchema = new mongoose.Schema({
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  license_number: { type: String, required: true },
  vehicle: {
    license_plate: { type: String, required: true },
    brand: { type: String, required: true },
    year_model: { type: Number, required: true }
  },
  status: { type: String, enum: ["available", "on_trip", "offline"], required: true, default: "offline" },
  rating: { type: Number, min: 0, max: 5 },
  created_at: { type: Date, default: Date.now }
});

const bookingsSchema = new mongoose.Schema({
  passenger_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: "Drivers"},
  booking_type: { type: String, enum: ["Delivery", "Ride"], required: true },
  pickup_location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true }
  },
  dropoff_location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true }
  },
  fare: { type: Number, required: true },
  status: { type: String, enum: ["requested", "accepted", "ongoing", "completed", "cancelled"], required: true },
  start_time: { type: Date },
  end_time: { type: Date },
  created_at: { type: Date, default: Date.now },
  rating: {
    passenger_rating: { type: Number, min: 0, max: 5 },
    passenger_comment: { type: String },
    driver_rating: { type: Number, min: 0, max: 5 },
    driver_comment: { type: String }
  }
});

const favoriteSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  home: {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    address: { type: String, required: false }
  },
  work: {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    address: { type: String, required: false }
  }
});

const Users = mongoose.model("Users", usersSchema);
const Drivers = mongoose.model("Drivers", driversSchema);
const Bookings = mongoose.model("Bookings", bookingsSchema);
const Favorites = mongoose.model("Favorites", favoriteSchema);

module.exports = { Users, Drivers, Bookings,Favorites };
