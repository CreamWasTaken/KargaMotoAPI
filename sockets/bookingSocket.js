const { Bookings } = require("../model/schema");

module.exports = (io, socket) => {
    console.log(`User connected: ${socket.id}`);

    // Get requested bookings
    socket.on('getRequestedBookings', async () => {
        try {
            const requestedBookings = await Bookings.find({ status: "requested" })
                .sort({ created_at: -1 }); // Newest first
            socket.emit('requestedBookingsData', requestedBookings);
        } catch (error) {
            console.error('Error fetching requested bookings:', error);
            socket.emit('error', { message: 'Failed to fetch requested bookings' });
        }
    });

    // Handle new booking creation
    // socket.on('newBooking', async (bookingData) => {
    //     try {
    //         // Validate and save to database
    //         const newBooking = new Bookings(bookingData);
    //         const savedBooking = await newBooking.save();
            
    //         // Broadcast to all connected clients
    //         io.emit('bookingUpdate', {
    //             action: 'created',
    //             booking: savedBooking
    //         });
            
    //     } catch (error) {
    //         console.error('Error creating booking:', error);
    //         socket.emit('error', { message: 'Failed to create booking' });
    //     }
    // });

    // Handle booking status updates
    socket.on('updateBookingStatus', async ({ bookingId, newStatus }) => {
        try {
            const updatedBooking = await Bookings.findByIdAndUpdate(
                bookingId,
                { status: newStatus },
                { new: true }
            );
            
            if (updatedBooking) {
                io.emit('bookingUpdate', {
                    action: 'status-updated',
                    booking: updatedBooking
                });
            }
        } catch (error) {
            console.error('Error updating booking status:', error);
            socket.emit('error', { message: 'Failed to update booking status' });
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
};