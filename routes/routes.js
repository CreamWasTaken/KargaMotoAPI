const express = require('express');
const router = express.Router();
const controller = require("../controller/controller");
const authMiddleware = require("../middleware/authmiddleware");

//test connection
router.get('/api/ping', (req, res) => {
    res.status(200).json({ message: "Pong" });
});

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
router.post('/api/update-user-details', controller.updateUserDetails);


//booking
router.post('/api/book-service', authMiddleware, controller.bookService);
router.get('/api/get-bookings', authMiddleware, controller.getBookings);
router.post('/api/accept-booking', authMiddleware, controller.acceptBooking);

//Favorite Locations
router.post('/api/add-favorites', authMiddleware, controller.addFavorites);
router.get('/api/get-favorites', authMiddleware, controller.getFavorites);
router.post('/api/delete-favorites', authMiddleware, controller.deleteFavorites);


//API to Web
// router.post('/api/get-drivers', controller.getDrivers);
router.post('/api/get-booking-details', controller.getBookings);

module.exports = router; 