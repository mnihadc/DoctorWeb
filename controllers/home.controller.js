const Booking = require("../models/Bookings.model");
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
    const userId = req.session.user.id;
    const selectedTime = new Date(appointmentTime);
    const endSelectedTime = new Date(selectedTime.getTime() + 20 * 60000); 
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).send("Doctor not found");
    }
    if (!doctor.dutyTime || typeof doctor.dutyTime !== "string") {
      return res.status(400).send("Doctor's duty hours are not properly set.");
    }
    const [startTime, endTime] = doctor.dutyTime.split(" - ");
    if (!startTime || !endTime) {
      return res.status(400).send("Duty time format is incorrect.");
    }

    const [startHour, startMinuteWithPeriod] = startTime.split(" ");
    const [startHourNum, startMinute] = startHour.split(":");
    const startPeriod = startMinuteWithPeriod; 

    const [endHour, endMinuteWithPeriod] = endTime.split(" ");
    const [endHourNum, endMinute] = endHour.split(":");
    const endPeriod = endMinuteWithPeriod;

    const dutyStart = new Date();
    const dutyEnd = new Date();

    dutyStart.setHours(
      startPeriod === "PM"
        ? parseInt(startHourNum) + 12
        : parseInt(startHourNum),
      parseInt(startMinute),
      0,
      0
    );

    dutyEnd.setHours(
      endPeriod === "PM" ? parseInt(endHourNum) + 12 : parseInt(endHourNum),
      parseInt(endMinute),
      0,
      0
    );
    if (selectedTime < dutyStart || endSelectedTime > dutyEnd) {
      return res
        .status(400)
        .send("Appointment time must be within doctor's duty hours.");
    }

    const newBooking = new Booking({
      doctorId,
      userId,
      appointmentTime: selectedTime,
    });

    await newBooking.save();
    res.status(201).send("Booking successful");
  } catch (error) {
    console.error(error); 
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
