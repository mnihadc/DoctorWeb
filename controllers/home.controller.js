const Doctor = require("../models/Doctor.model");

const getHome = (req, res, next) => {
  res.render("partials/Home", {
    title: "Home",
    layout: "Layout/main",
    isHomePage: true,
    isAdmin: req.session.user?.isAdmin,
    isAuthenticated: !!req.session.user,
  });
};
const getDoctor = (req, res, next) => {
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
const getAbout = (req, res, next) => {
  res.render("partials/About", {
    title: "About",
    layout: "Layout/main",
    isAboutPage: true,
    isAdmin: req.session.user?.isAdmin,
    isAuthenticated: !!req.session.user,
  });
};
const TokenBooking = async (req, res, next) => {
  try {
    const { doctorId, appointmentTime } = req.body;
    const userId = req.session.user._id;
    const selectedTime = new Date(appointmentTime);
    const currentTime = new Date();
    const validBookingTime = new Date(currentTime.getTime() + 30 * 60000);

    const timeDifference = Math.abs(
      selectedTime.getTime() - validBookingTime.getTime()
    );
    const oneMinute = 60 * 1000;

    if (timeDifference > oneMinute) {
      return res
        .status(400)
        .send("Appointment time must be exactly 30 minutes from now.");
    }

    const newBooking = new Booking({
      doctorId,
      userId,
      appointmentTime: selectedTime,
    });

    await newBooking.save();
    res.status(201).send("Booking successful");
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getHome,
  getDoctor,
  getDoctorDetails,
  getAbout,
  TokenBooking,
};
