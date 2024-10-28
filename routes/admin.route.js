const express = require("express");
const { dashboard } = require("../controllers/admin.controller");
const verifyToken = require("../middleware/verifyToken");
const route = express.Router();

route.get("/dashboard", verifyToken, dashboard);
module.exports = route;
