const express = require("express");
const {
  getLogin,
  Signup,
  Login,
  Logout,
} = require("../controllers/auth.controller");
const verifyToken = require("../middleware/verifyToken");
const route = express.Router();

route.get("/login", getLogin);
route.post("/signup", Signup);
route.post("/login", Login);
route.get("/logout", verifyToken, Logout);

module.exports = route;
