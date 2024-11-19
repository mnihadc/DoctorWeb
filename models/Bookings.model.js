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
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Adding a unique index to prevent overlapping appointments
bookingSchema.index({ doctorId: 1, appointmentTime: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
