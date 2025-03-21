require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const connection = require("./model/database");
const cors = require("cors");
const session = require('express-session');

const app = express();
const PORT = 5000;

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Set to true if using HTTPS
  }));
  

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Database connection
connection();

// Routes
app.use("/", (req, res, next) => {
    if (req.path === '/') {
        res.send("KargaMoto API is running");
    } else {
        next();
    }
});
app.use("/", routes);

// Internet
app.listen(PORT, '0.0.0.0', () => {
    console.log(`KargaMoto API is running on http://0.0.0.0:${PORT}`);
});

// Localhost
// app.listen(PORT, 'localhost', () => {
//     console.log(`KargaMoto API is running on http://localhost:${PORT}`);
// }); 


//to do 

//responsive OTP button Deposit button

//add refresh tokens or logic behind 1 hour token expiry logout after token expiry

//add auto logout after token expiry

//change async storage to 

//add to pin homes and works


