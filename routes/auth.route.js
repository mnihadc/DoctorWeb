const express = require("express");
const { getLogin, Signup } = require("../controllers/auth.controller");
const route = express.Router();

route.get("/login", getLogin);
route.post("/signup", Signup);

module.exports = route;
