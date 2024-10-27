const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const saltRounds = 10;

const getLogin = (req, res, next) => {
  res.render("partials/Login", {
    title: "Login",
    layout: "Layout/main",
    isLoginPage: true,
    errorMessage: null,
  });
};

const Signup = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (username.length <= 5) {
      return res.render("partials/Login", {
        title: "Signup",
        layout: "Layout/main",
        isLoginPage: true,
        errorMessage: "Username must be more than 5 characters long.",
      });
    }
    if (password.length < 8) {
      return res.render("partials/Login", {
        title: "Signup",
        layout: "Layout/main",
        isLoginPage: true,
        errorMessage: "Password must be at least 8 characters long.",
      });
    }

    if (confirmPassword !== password) {
      return res.render("partials/Login", {
        title: "Signup",
        layout: "Layout/main",
        isLoginPage: true,
        errorMessage: "Passwords do not match.",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("partials/Login", {
        title: "Signup",
        layout: "Layout/main",
        isLoginPage: true,
        errorMessage: "User with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.redirect("/auth/login");
  } catch (error) {
    next(error);
  }
};

module.exports = { getLogin, Signup };
