const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema({
  name: String,
  image: String,
  dutyTime: String,
  specialization: String,
  bio: String,
  contact: {
    phone: String,
    email: String,
  },
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
