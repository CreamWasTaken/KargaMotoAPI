require("dotenv").config(); 
const mongoose = require("mongoose");
const express = require('express');
const { Users, Drivers,Bookings,Favorites } = require("../model/schema");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
//const cookieParser = require('cookie-parser');
const axios = require('axios');

const saltrounds = 10;

//formats phone number 09123456789
const FormatNumber = (phone_number) => {
  let formattedNumber = phone_number.toString().replace(/\s+/g, '').replace(/-/g, '');

  if (formattedNumber.startsWith('+63')) {
    formattedNumber = '0' + formattedNumber.slice(3);
  } else if (!formattedNumber.startsWith('0')) {
    formattedNumber = '0' + formattedNumber;
  }

  return formattedNumber;
};



//temporary
exports.createUser = async (req, res) => {
    try {
      const { full_name, phone_number, gender } = req.body;
      const formattedPhoneNumber = FormatNumber(phone_number);
      const user_type = "Passenger";
      const verification = "No"
  
      if (!full_name || !formattedPhoneNumber || !user_type || !verification) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if phone number already exists
      const phoneExists = await Users.findOne({ phone_number: formattedPhoneNumber });
      if (phoneExists) {
        return res.status(400).json({ error: "Phone number already exists" });
      }
  
      const user = new Users({
        full_name,
        phone_number: formattedPhoneNumber,
        user_type,
        verification,
        created_at: Date.now() ,
        gender: gender
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

//code for getting user details
exports.getUserDetails = async (req, res) => {
  try {
    console.log("User in request:", req.user); // Debugging: Check if _id exists
    const userId = req.user._id;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.user_type === "Driver") {
      const driver = await Drivers.findOne({ driver_id: userId });
      if (driver) {
        return res.status(200).json({ user: user, driver: driver });
      } else {
        return res.status(404).json({ error: "Driver details not found" });
      }
    }

    res.status(200).json({ user: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

//code for updating user details
exports.updateUserDetails = async (req, res) => {
  try {
    // const user_id = req.user._id; // Get from token
    const { gender, full_name,phone_number } = req.body;

    if (!gender || !full_name || full_name.trim() === "") {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Update only `full_name` and `gender`
    const updatedUser = await Users.findOneAndUpdate(
      { phone_number }, // Find by phone_number
      { $set: { gender, full_name: full_name.trim() } }, // Ensures only these fields are updated
      { new: true, runValidators: true } // Returns updated document & runs validation
);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Update User Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//Authentication
exports.userLogin = async (req, res) => {
  try {
    const { phone_number } = req.body;
    const formattedPhoneNumber = FormatNumber(phone_number);
    
    console.log("formattedPhoneNumber:", formattedPhoneNumber);
    
    const user = await Users.findOne({ phone_number: formattedPhoneNumber });
    
    if (!user) {
      console.log("User Not Found tick");
      return res.status(200).json({ status: "0" });
    } else {
      try {
        await sendOTP(req, phone_number); 
        res.status(200).json({ status: "1", user_type: user.user_type });
      } catch (error) {
        console.error("Error sending OTP:", error.message);
        res.status(400).json({ error: "Failed to send OTP", status: "Error" });
      }
    }
  } catch (err) {
    res.status(400).json({ error: err.message, status: "Error" });
  }
};

const sendOTP = async (req, phone_number) => {

  //change if needed only added for hosting purposes
  // const otp = Math.floor(100000 + Math.random() * 900000);
  const otp = 123456; 

  const message = `Your OTP is ${otp}`;
  const formattedPhoneNumber = FormatNumber(phone_number);

  // Check if OTP can be resent
  // if (req.session.lastOTPSent && Date.now() - req.session.lastOTPSent < 60 * 1000) {
  //   throw new Error("Please wait before requesting a new OTP.");
  // }   

  // Send OTP using Semaphore API
  return new Promise(async (resolve, reject) => {
    // try {
    //   const response = await axios.post("https://api.semaphore.co/api/v4/messages", {
    //     apikey: process.env.SEMAPHORE_API_KEY,
    //     number: formattedPhoneNumber,
    //     message: message
    //   });
    //   console.log("Semaphore API response:", response.data);
    //   console.log("Phone number:", formattedPhoneNumber);
    //   console.log("Message:", message);
    // } catch (error) {
    //   console.log("Error sending OTP via Semaphore API:", error.message);
    //   return reject(new Error("Failed to send OTP"));
    // }

    try {
      req.session.otp = otp;
      req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
      req.session.lastOTPSent = Date.now(); // Track the last OTP sent time
      console.log("session OTP (login):", req.session.otp, "Type of OTP:", typeof req.session.otp);
      resolve();
    } catch (error) {
      console.error("Error saving OTP to session:", error.message);
      return reject(new Error("Failed to save OTP to session"));
    }
  });
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;
    const formattedPhoneNumber = FormatNumber(phone_number);

    console.log("body OTP:", otp);

    // Check if phone number exists
    const user = await Users.findOne({ phone_number: formattedPhoneNumber });

    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }


    // Check if OTP has expired
    if (Date.now() > req.session.otpExpiry) {
      req.session.otp = null; // Clear OTP
      return res.status(400).json({ error: "OTP has expired" });
    }
    console.log("session OTP (verify):", req.session.otp, "Type of OTP:", typeof req.session.otp);
    // Verify OTP
    if (req.session.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Clear OTP after successful verification
    req.session.otp = null;

    // Generate token after successful OTP verification
    const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }); //refresh token
    console.log("token:", token);

    res.status(200).json({ status: "OTP verified", user_type: user.user_type, token: token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.userLogout = async (req, res) => {
  req.session.destroy();
  console.log("Session destroyed");
  res.status(200).json({ status: "User logged out successfully" });
}

exports.RegisterDriver = async (req, res) => {
  try {
      const { full_name, phone_number, license_number, vehicle, status, rating } = req.body;
      const formattedPhoneNumber = FormatNumber(phone_number);
      const user_type = "driver";
      const verification = "Yes";
     

      //check if all fields are provided
      if (!full_name || !formattedPhoneNumber || !user_type || !verification) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if phone number already exists
      const phoneExists = await Users.findOne({ phone_number: formattedPhoneNumber });
      if (phoneExists) {
        return res.status(400).json({ error: "Phone number already exists" });
      }

      //create user
      const user = new Users({
        full_name,
        phone_number: formattedPhoneNumber,
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


//booking service
exports.bookService = async (req, res) => {
  try {
    const passenger_id = req.user._id; //user_id from token
    const { pickup_location, dropoff_location, booking_type,fare } = req.body;
    const status = "requested";
    


    //check if all fields are provided
      if (!pickup_location || !dropoff_location || !booking_type) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      const booking = new Bookings({
        passenger_id: passenger_id,
        pickup_location: pickup_location,
        dropoff_location: dropoff_location,
        booking_type: booking_type,
        status: status,
        fare: fare,
        created_at: Date.now()
      })

      await booking.save();

      res.status(201).json({ status: "Booking created successfully" });

  }catch (err) {
    res.status(400).json({ error: err.message });
  }
  
}

 //example body of booking
  // {
  //   "booking_type": "Ride",
  //   "pickup_location": {
  //     "latitude": 40.712776,
  //     "longitude": -74.005974,
  //     "address": "123 Main Street, New York, NY"
  //   },
  //   "dropoff_location": {
  //     "latitude": 40.73061,
  //     "longitude": -73.935242,
  //     "address": "456 Elm Street, Brooklyn, NY"
  //   },
  //   "fare": 25.5,
  //   "status": "requested",
  //   "end_time": "2025-03-07T12:30:00Z",
  //   "rating": {
  //     "passenger_rating": 0,
  //     "driver_rating": 0
  //   }
  // }

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Bookings.find({ status: "requested" });
    res.status(200).json({ data: bookings });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

exports.cancelBookings = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const booking = await Bookings.findByIdAndUpdate(booking_id, { status: "cancelled" });
    res.status(200).json({ status: "Booking cancelled successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

exports.addFavorites = async (req, res) => {
  try {
    const { home, work } = req.body;
    const user_id = req.user._id;

    // Check if either home or work is provided
    if (!home && !work) {
      return res.status(400).json({ error: "Either home or work must be provided" });
    }

    // Validate home input
    if (home && (!home.latitude || !home.longitude || !home.address)) {
      return res.status(400).json({ error: "Home fields are incomplete" });
    }

    // Validate work input
    if (work && (!work.latitude || !work.longitude || !work.address)) {
      return res.status(400).json({ error: "Work fields are incomplete" });
    }

    // Find existing favorites for the user
    let favorite = await Favorites.findOne({ user_id });

    if (!favorite) {
      // Create a new favorite document if not found
      favorite = new Favorites({ user_id, homes: [], works: [] });
    }

    // Append new locations to the arrays instead of overwriting
    if (home) favorite.homes.push(home);
    if (work) favorite.works.push(work);

    await favorite.save();

    res.status(200).json({ status: "Favorites updated successfully", data: favorite });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// example body for favorites
// {
//   "work": {
//     "latitude": 37.32,
//     "longitude": -121.83,
//     "address": "dola"
//   },
//   "home": {
//     "latitude": 37.3082,
//     "longitude": -121.813,
//     "address": "ls"
//   }
// }

exports.deleteFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.body; // Now expecting an ID instead of address string

    if (!userId || !addressId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID or address ID missing."
      });
    }

    // First find the favorite document
    const favorite = await Favorites.findOne({ user_id: userId });
    
    if (!favorite) {
      return res.status(404).json({ 
        success: false, 
        message: "No favorites found for this user." 
      });
    }

    // Check if the ID exists in either homes or works
    const homeIndex = favorite.homes.findIndex(h => h._id.equals(addressId));
    const workIndex = favorite.works.findIndex(w => w._id.equals(addressId));

    if (homeIndex === -1 && workIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Address ID not found in favorites."
      });
    }

    // Build update query based on where the ID was found
    const updateQuery = {
      $pull: {}
    };

    if (homeIndex !== -1) {
      updateQuery.$pull.homes = { _id: addressId };
    } else {
      updateQuery.$pull.works = { _id: addressId };
    }

    const updatedFavorite = await Favorites.findOneAndUpdate(
      { user_id: userId },
      updateQuery,
      { new: true }
    );

    return res.status(200).json({ 
      success: true, 
      data: updatedFavorite,
      message: "Address deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting favorite:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user_id = req.user._id;
    const favorite = await Favorites.findOne({ user_id });

    if (!favorite) {
      return res.status(404).json({ error: "Favorites not found" });
    }

    res.status(200).json({ data: favorite });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};










 
