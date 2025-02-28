require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const connection = require("./model/database");
const cors = require("cors");
const session = require('express-session');

const app = express();


app.use(session({
    secret: process.env.SESSION_SECRET, // Ensure you have this in your .env file
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
  }));
  

// Middleware
app.use(cors());
app.use(express.json()); // Built-in middleware to parse JSON
app.use(express.urlencoded({ extended: true })); // To handle URL encoded data

// Database connection
connection();

// Routes
app.use("/", routes);

// Server setup
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`KargaMoto API is running on http://0.0.0.0:${PORT}`);
});

// Server setup
// const PORT = 5000;
// app.listen(PORT, 'localhost', () => {
//     console.log(`KargaMoto API is running on http://localhost:${PORT}`);
// }); 
