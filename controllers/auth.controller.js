const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.redirect("/auth/login");
  } catch (error) {
    next(error);
  }
};

const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_KEY;

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("partials/Login", {
        title: "Login",
        layout: "Layout/main",
        isLoginPage: true,
        errorMessage: "User with this email does not exist.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("partials/Login", {
        title: "Login",
        layout: "Layout/main",
        isLoginPage: true,
        errorMessage: "Incorrect password.",
      });
    }

    // Set session data and isAdmin flag
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: email === adminEmail,
    };

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: email === adminEmail },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    if (email === adminEmail) {
      return res.render("partials/Home", {
        title: "Home",
        layout: "Layout/main",
        isHomePage: true,
        isAuthenticated: !!req.session.user,
        isAdmin: true,
      });
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    next(error);
  }
};

const Logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.clearCookie("token");
    res.redirect("/auth/login");
  });
};

module.exports = { getLogin, Signup, Login, Logout };
