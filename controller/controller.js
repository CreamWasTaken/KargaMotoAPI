require("dotenv").config(); 
const mongoose = require("mongoose");
const express = require('express');
const { Users, Drivers,Bookings } = require("../model/schema");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
//const cookieParser = require('cookie-parser');
const axios = require('axios');

const saltrounds = 10;



//temporary
exports.createUser = async (req, res) => {
    try {
      const { full_name, phone_number,  } = req.body;
      const user_type = "passenger";
      const verification = "No"
  
      if (!full_name || !phone_number || !user_type || !verification) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if phone number already exists
      const phoneExists = await Users.findOne({ phone_number });
      if (phoneExists) {
        return res.status(400).json({ error: "Phone number already exists" });
      }
  
      const user = new Users({
        full_name,
        phone_number,
        user_type,
        verification,
        created_at: Date.now() 
      });
  
      await user.save();
  
      
      res.status(200).json({ status: "User registered successfully", data: user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };


exports.createDriver = async (req, res) => {
    try {
      const { driver_id, license_number, vehicle, status, rating } = req.body;

      // Check if user_id exists in Users collection
      const userExists = await Users.findById(driver_id);
      if (!userExists) {
        return res.status(400).json({ error: "User ID does not exist" });
      }

      const driver = new Drivers({
        driver_id,
        license_number,
        vehicle,
        status,
        rating,
        created_at: Date.now()
      });
      
      await driver.save();
      res.status(201).json(driver);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
};

exports.testMiddleware = async (req, res) => {
  const { longitude, latitude } = req.body;
  

}

//example code for getting user details
exports.getUserDetails = async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await Users.findById(user_id);

    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}



//Authentication
exports.userLogin = async (req, res) => {
  try {

    const { phone_number } = req.body;
    const user = await Users.findOne({ phone_number });

    if (!user) {
    console.log("User Not Found tick");
    return res.status(200).json({ status: "0" });
    }else{

    const otp = Math.floor(100000 + Math.random() * 900000);
    const message = `Your OTP is ${otp}`;

    // Send OTP using Semaphore API
    // try {
    //   const response = await axios.post("https://api.semaphore.co/api/v4/messages", {
    //     apikey: process.env.SEMAPHORE_API_KEY,
    //     number: phone_number,
    //     message: message
    //   });
    //   console.log("Semaphore API response:", response.data);
    //   console.log("Phone number:", phone_number);
    //   console.log("Message:", message);
    // } catch (error) {
    //   console.log("Error sending OTP via Semaphore API:", error.message);
    //   throw error;
    // }

    // Save OTP to user document for verification
      try {
        req.session.otp = otp;
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        console.log("session OTP (login):", req.session.otp);
      } catch (error) {
        console.error("Error saving OTP to session:", error.message);
        throw error;
      }

    res.status(200).json({ status: "1", user_type: user.user_type });
    }
  } catch (err) {
    res.status(400).json({ error: err.message, status: "Error" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;

    console.log("body OTP:", otp);

    // Check if phone number exists
    const user = await Users.findOne({ phone_number });

    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }

    console.log("session OTP (verify):", req.session.otp);

    // Check if OTP has expired
    if (Date.now() > req.session.otpExpiry) {
      req.session.otp = null; // Clear OTP
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Verify OTP
    if (req.session.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Clear OTP after successful verification
    req.session.otp = null;

    // Generate token after successful OTP verification
    const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("token:", token);

    res.status(200).json({ status: "OTP verified", user_type: user.user_type, token: token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.RegisterDriver = async (req, res) => {
  try {
      const { full_name, phone_number, license_number, vehicle, status, rating } = req.body;
      const user_type = "driver";
      const verification = "Yes";
      
      //check if all fields are provided
      if (!full_name || !phone_number || !user_type || !verification) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if phone number already exists
      const phoneExists = await Users.findOne({ phone_number });
      if (phoneExists) {
        return res.status(400).json({ error: "Phone number already exists" });
      }

      //create user
      const user = new Users({
        full_name,
        phone_number,
        user_type,
        verification,
        created_at: Date.now() 
      });
      await user.save();

      //create driver
      const driver = new Drivers({
        driver_id: user._id,
        license_number,
        vehicle,
        status,
        rating,
        created_at: Date.now()
      }); 
      await driver.save();

      res.status(201).json({ status: "Driver registered successfully" });
      
    } catch (err) {
    res.status(400).json({ error: err.message });
      }
} 

exports.bookService = async (req, res) => {
  try {
    const passenger_id = req.user.id; //user_id from token
    const { pickup_location, dropoff_location, booking_type } = req.body;
    
    //check if all fields are provided
      if (!pickup_location || !dropoff_location || !booking_type) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      const booking = new Bookings({
        passenger_id: passenger_id,
        pickup_location: pickup_location,
        dropoff_location: dropoff_location,
        booking_type: booking_type,
        status: "requested",
        created_at: Date.now()
      })

      await booking.save();

      res.status(201).json({ status: "Booking created successfully" });

  }catch (err) {
    res.status(400).json({ error: err.message });
  }
}








 
