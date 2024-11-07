const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 5,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  isWaitingForCall: {
    type: Boolean,
    default: false, // By default, users are not waiting for a call
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
