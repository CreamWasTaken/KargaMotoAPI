const express = require('express');
const router = express.Router();
const controller = require("../controller/controller");
const authMiddleware = require("../middleware/authmiddleware");

//temporary
router.post('/api/drivers', controller.createDriver);
router.get('/api/test', authMiddleware, controller.testMiddleware);

//registrations
router.post('/api/register-user', controller.createUser);

//Registration From Website Admin to Mobile Database
router.post('/api/register-driver', controller.RegisterDriver);


//Authentication
router.post('/api/login', controller.userLogin);
router.post('/api/verify-otp', controller.verifyOTP);
router.post('/api/logout', controller.userLogout);

//get user details
router.get('/api/get-user-details', authMiddleware, controller.getUserDetails);


//booking
router.post('/api/book-service', authMiddleware, controller.bookService);
router.get('/api/get-bookings', authMiddleware, controller.getBookings);


module.exports = router; 