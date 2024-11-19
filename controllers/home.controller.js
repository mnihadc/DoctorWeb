const jwt = require("jsonwebtoken");

const getHome = (req, res, next) => {
  console.log("JWT User:", req.user); // This will now log the decoded user information
  res.render("partials/Home", {
    title: "Home",
    layout: "Layout/main",
    isHomePage: true,
    isAdmin: req.user?.isAdmin, // Access `isAdmin` from the JWT
    isAuthenticated: !!req.user, // Check if the user is authenticated
  });
};

const getAbout = (req, res, next) => {
  res.render("partials/About", {
    title: "About",
    layout: "Layout/main",
    isAboutPage: true,
    isAdmin: req.user?.isAdmin, // Extract `isAdmin` from the JWT
    isAuthenticated: !!req.user, // Check if user is authenticated (JWT exists)
  });
};

module.exports = { getHome, getAbout };
