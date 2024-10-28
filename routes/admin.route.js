const express = require("express");
const { dashboard } = require("../controllers/admin.controller");
const route = express.Router();

route.get("/dashboard", dashboard);
module.exports = route;
