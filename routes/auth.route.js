const express = require("express");
const { getLogin } = require("../controllers/auth.controller");
const route = express.Router();

route.get("/login", getLogin);

module.exports = route;
