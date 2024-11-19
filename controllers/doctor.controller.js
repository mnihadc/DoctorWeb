const Booking = require("../models/Bookings.model");
const Doctor = require("../models/Doctor.model");
const cron = require("node-cron");
const mongoose = require("mongoose");
const User = require("../models/User.model");

// Function to send in-app notification
const sendInAppNotification = async (userId, appointmentDetails) => {
  console.log(
    `Sending notification to User ID: ${userId}, Details: ${appointmentDetails}`
  );
  // Implement WebSocket or real-time communication logic here
};

// Function to check appointments and notify users
const checkAppointments = async () => {
  console.log("Checking for appointments...");
  try {
    const now = new Date();
    const bookings = await Booking.find({
      appointmentTime: { $gte: now, $lt: new Date(now.getTime() + 60000) }, // Next minute
      notificationSent: false,
    }).populate("userId");

    for (const booking of bookings) {
      const appointmentDetails = `Your appointment is starting soon. Click OK to join the video call.`;

      // Notify user and admin
      await sendInAppNotification(booking.userId._id, appointmentDetails);
      await sendInAppNotification("mnc@gmail.com", appointmentDetails); // Admin notification

      // Mark as notified
      booking.notificationSent = true;
      await booking.save();
    }
  } catch (error) {
    console.error("Error checking appointments:", error);
  }
};

// Schedule the appointment check every minute
cron.schedule("* * * * *", checkAppointments);

// Controller methods
const getDoctor = (req, res) => {
  const user = req.user; // Get user from the token
  res.render("partials/Doctor", {
    title: "Doctor",
    layout: "Layout/main",
    isDoctorPage: true,
    isAdmin: user?.isAdmin, // Check if user is admin
    isAuthenticated: !!user, // Check if the user exists
  });
};

const getDoctorDetails = async (req, res, next) => {
  try {
    const doctorName = req.params.doctorName;
    const doctorData = await Doctor.find({
      specialization: new RegExp(doctorName, "i"),
    });

    if (doctorData.length === 0) {
      return res.status(404).send("No doctors found with that specialization");
    }

    const user = req.user; // Get user from the token
    res.render("partials/ViewDoctor", {
      title: `${doctorName} Profile`,
      layout: "Layout/main",
      isViewDoctorPage: true,
      doctorData,
      isAdmin: user?.isAdmin,
      isAuthenticated: !!user,
    });
  } catch (error) {
    next(error);
  }
};

const TokenBooking = async (req, res, next) => {
  try {
    const { doctorId, appointmentTime } = req.body;
    const userId = req.user.id; // Accessing userId from the JWT token

    if (!userId) {
      return res.status(400).send("User ID is required.");
    }

    const selectedTime = new Date(appointmentTime);
    const endSelectedTime = new Date(selectedTime.getTime() + 20 * 60000); // +20 minutes

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).send("Doctor not found");

    // Create new booking
    const newBooking = new Booking({
      doctorId,
      userId,
      appointmentTime: selectedTime,
    });

    await newBooking.save();
    res.redirect("/doctor/get-token");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getTokenPage = async (req, res, next) => {
  try {
    const userId = req.user.id; // Get user ID from the token
    const now = new Date();
    const bookings = await Booking.find({
      userId,
      appointmentTime: { $gte: now },
    }).populate("doctorId");

    const bookingDetails = await Promise.all(
      bookings.map(async (booking) => {
        const doctor = booking.doctorId;
        const appointmentStartTime = new Date(booking.appointmentTime);
        const isJoinable =
          now >= new Date(appointmentStartTime - 2 * 60 * 1000) &&
          now < appointmentStartTime; // 2 minutes before

        return {
          doctorName: doctor.name,
          userId: userId,
          specialization: doctor.specialization,
          appointmentTime: booking.appointmentTime,
          createdAt: booking.createdAt,
          userName: req.user.username,
          userEmail: req.user.email,
          _id: booking._id,
          doctorId: booking.doctorId,
          isJoinable,
        };
      })
    );

    res.render("partials/Token", {
      title: "Your Token Page",
      layout: "Layout/main",
      isTokenPage: true,
      data: bookingDetails,
      isAdmin: req.user?.isAdmin,
      isAuthenticated: !!req.user,
      isEmpty: bookingDetails.length === 0,
    });
  } catch (error) {
    next(error);
  }
};

const getHistoryToken = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const now = new Date();
    const bookings = await Booking.find({
      userId,
      appointmentTime: { $lt: now },
    }).populate("doctorId");

    const bookingDetails = bookings.map((booking) => ({
      doctorName: booking.doctorId.name,
      dutyTime: booking.doctorId.dutyTime,
      appointmentTime: booking.appointmentTime,
      createdAt: booking.createdAt,
      userName: req.session.user.username,
      userEmail: req.session.user.email,
    }));

    res.render("partials/TokenHistory", {
      title: "Your Token History Page",
      layout: "Layout/main",
      isTokenHistoryPage: true,
      data: bookingDetails,
      isAdmin: req.session.user?.isAdmin,
      isAuthenticated: !!req.session.user,
      isEmpty: bookingDetails.length === 0,
    });
  } catch (error) {
    next(error);
  }
};

const videoCall = async (req, res, next) => {
  try {
    const user = req.user; // Get user from the token
    const { userId } = req.query; // Only userId is needed for the call.

    // Validate the user ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    // Fetch the user who is waiting for the call
    const callUser = await User.findById(userId);
    if (!callUser) {
      return res.status(404).send("User not found");
    }

    // Set the user as 'waiting for the call'
    await User.findByIdAndUpdate(userId, { isWaitingForCall: true });

    // Now you may not need the appointment, but you might want to show doctor info
    const doctorName = user?.isAdmin ? "Admin" : "Doctor"; // Simplify if it's the admin or a real doctor
    const specialization = user?.isAdmin ? "Admin" : "General Medicine"; // Just an example for specialization

    res.render("partials/videoCall", {
      title: "Video Call",
      layout: "Layout/main",
      userName: callUser.username,
      userEmail: callUser.email,
      doctorName: doctorName,
      specialization: specialization,
      isAdmin: user?.isAdmin,
      isAuthenticated: !!user,
    });
  } catch (error) {
    console.error("Error in video call:", error);
    next(error);
  }
};

module.exports = {
  getDoctor,
  getDoctorDetails,
  TokenBooking,
  getTokenPage,
  getHistoryToken,
  videoCall,
};
