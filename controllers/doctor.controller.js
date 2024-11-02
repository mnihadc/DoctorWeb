const Booking = require("../models/Bookings.model");
const Doctor = require("../models/Doctor.model");

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

const TokenBooking = async (req, res, next) => {
  try {
    const { doctorId, appointmentTime } = req.body;
    const userId = req.session.user.id;
    const selectedTime = new Date(appointmentTime);
    const endSelectedTime = new Date(selectedTime.getTime() + 20 * 60000); // +20 minutes

    // Retrieve doctor data
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).send("Doctor not found");
    }

    if (!doctor.dutyTime || typeof doctor.dutyTime !== "string") {
      return res.status(400).send("Doctor's duty hours are not properly set.");
    }

    // Parse the doctor's duty time
    const [startTime, endTime] = doctor.dutyTime.split(" - ");
    if (!startTime || !endTime) {
      return res.status(400).send("Duty time format is incorrect.");
    }

    const [startHourMinute, startPeriod] = startTime.split(" ");
    const [endHourMinute, endPeriod] = endTime.split(" ");
    const [startHour, startMinute] = startHourMinute.split(":");
    const [endHour, endMinute] = endHourMinute.split(":");

    // Set duty hours on the current date
    const currentDate = new Date();
    const dutyStart = new Date(currentDate);
    const dutyEnd = new Date(currentDate);

    dutyStart.setHours(
      startPeriod === "PM" ? parseInt(startHour) + 12 : parseInt(startHour),
      parseInt(startMinute),
      0,
      0
    );
    dutyEnd.setHours(
      endPeriod === "PM" ? parseInt(endHour) + 12 : parseInt(endHour),
      parseInt(endMinute),
      0,
      0
    );

    // Check if selected time is within duty hours on the current date
    if (
      selectedTime.getDate() !== currentDate.getDate() ||
      selectedTime < dutyStart ||
      endSelectedTime > dutyEnd
    ) {
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
    const bookings = await Booking.find({ userId }).populate("doctorId");

    const bookingDetails = await Promise.all(
      bookings.map(async (booking) => {
        const doctor = booking.doctorId;

        return {
          doctorName: doctor.name,
          dutyTime: doctor.dutyTime,
          appointmentTime: booking.appointmentTime,
          createdAt: booking.createdAt,
          userName: req.session.user.username,
          userEmail: req.session.user.email,
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
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctor,
  getDoctorDetails,
  TokenBooking,
  getTokenPage,
};
