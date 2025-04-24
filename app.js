require("dotenv").config(); // Load environment variables
const express = require("express");
const http = require("http"); // Add this for Socket.IO
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const connection = require("./model/database");
const cors = require("cors");
const session = require('express-session');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketio(server, { // Initialize Socket.IO
  cors: {
    origin: "*", // Adjust this in production
    methods: ["GET", "POST"]
  }
});
const PORT = 5000;

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Database connection
connection();

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handler
require('./sockets')(io); // We'll create this file next

// Serve static files from public directory
app.use(express.static('public'));

// Routes
app.use("/", (req, res, next) => {
    if (req.path === '/') {
        res.send("KargaMoto API is running");
    } else {
        next();
    }
});
app.use("/", routes);

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`KargaMoto API is running on http://0.0.0.0:${PORT}`);
});

// Localhost
// server.listen(PORT, 'localhost', () => {
//     console.log(`KargaMoto API is running on http://localhost:${PORT}`);
// }); 


//to do 


//add auto logout after token expiry

//add no internet connection screen

//add no connection to sever screen

//add in kargamotoapp to emit newbooking event to all drivers

//profile setting screen is gone 

//use hybrid set up for socket and rest api

// Expo App->>Socket.IO (WebSocket): "lat/lng" (via socket.emit)
//     Socket.IO->>MongoDB: Save data (optional)
//     Socket.IO->>All Other Apps: Push update (via io.emit)


