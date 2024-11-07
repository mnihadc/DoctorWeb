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
  res.render("partials/Doctor", {
    title: "Doctor",
    layout: "Layout/main",
    isDoctorPage: true,
    isAdmin: req.session.user?.isAdmin,
    isAuthenticated: !!req.session.user,
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

    res.render("partials/ViewDoctor", {
      title: `${doctorName} Profile`,
      layout: "Layout/main",
      isViewDoctorPage: true,
      doctorData,
      isAdmin: req.session.user?.isAdmin,
      isAuthenticated: !!req.session.user,
    });
  } catch (error) {
    next(error);
  }
};

const TokenBooking = async (req, res, next) => {
  try {
    const { doctorId, appointmentTime } = req.body;
    const userId = req.session.user.id;
    const selectedTime = new Date(appointmentTime);
    const endSelectedTime = new Date(selectedTime.getTime() + 20 * 60000); // +20 minutes

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).send("Doctor not found");

    if (!doctor.dutyTime || typeof doctor.dutyTime !== "string") {
      return res.status(400).send("Doctor's duty hours are not properly set.");
    }

    // Parse doctor's duty time
    const [startTime, endTime] = doctor.dutyTime.split(" - ");
    const [startHourMinute, startPeriod] = startTime.split(" ");
    const [endHourMinute, endPeriod] = endTime.split(" ");
    const [startHour, startMinute] = startHourMinute.split(":");
    const [endHour, endMinute] = endHourMinute.split(":");

    const currentDate = new Date();
    const dutyStart = new Date(currentDate);
    const dutyEnd = new Date(currentDate);

    dutyStart.setHours(
      startPeriod === "PM" && parseInt(startHour) !== 12
        ? parseInt(startHour) + 12
        : parseInt(startHour),
      parseInt(startMinute),
      0,
      0
    );
    dutyEnd.setHours(
      endPeriod === "PM" && parseInt(endHour) !== 12
        ? parseInt(endHour) + 12
        : parseInt(endHour),
      parseInt(endMinute),
      0,
      0
    );

    // Check if the selected time is within the doctor's duty hours
    if (selectedTime < dutyStart || endSelectedTime > dutyEnd) {
      return res
        .status(400)
        .send("Appointment time must be within today's duty hours.");
    }

    // Create the booking
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
    const userId = req.session.user.id;
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
          userName: req.session.user.username,
          userEmail: req.session.user.email,
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
      isAdmin: req.session.user?.isAdmin,
      isAuthenticated: !!req.session.user,
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
    const admin = req.session.user.isAdmin;
    const { userId, appointmentId } = req.query;

    // Log the userId and appointmentId for debugging
    console.log("Received userId:", userId);
    console.log("Received appointmentId:", appointmentId);

    // Check if userId and appointmentId are valid
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).send("Invalid appointment ID");
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Set isWaitingForCall to true for the user when the admin connects
    await User.findByIdAndUpdate(userId, { isWaitingForCall: true });

    // Fetch appointment details
    const appointment = await Booking.findById(appointmentId);
    if (!appointment) {
      return res.status(404).send("Appointment not found");
    }

    // Render video call page
    res.render("partials/videoCall", {
      title: "Video Call",
      layout: "Layout/main",
      userName: user.username,
      userEmail: user.email,
      doctorName: admin ? "Admin" : appointment.doctorId.name,
      specialization: admin ? "Admin" : appointment.doctorId.specialization,
      appointmentTime: appointment.appointmentTime, // Show appointment time
      isAdmin: req.session.user?.isAdmin,
      isAuthenticated: !!req.session.user,
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
