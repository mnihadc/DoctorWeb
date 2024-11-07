const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    appointmentTime: {
      type: Date,
      required: true,
      validate: {
        validator: (v) => v >= new Date(),
        message: "Appointment time must be in the future.",
      },
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
