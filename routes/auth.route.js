const express = require("express");
const { getLogin, Signup, Login } = require("../controllers/auth.controller");
const route = express.Router();

route.get("/login", getLogin);
route.post("/signup", Signup);
route.post("/login", Login);

module.exports = route;
