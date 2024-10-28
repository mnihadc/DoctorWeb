const express = require("express");
const { dashboard, updateUser } = require("../controllers/admin.controller");
const verifyToken = require("../middleware/verifyToken");
const route = express.Router();

route.get("/dashboard", verifyToken, dashboard);
route.put("/update-user/:id", verifyToken, updateUser);

module.exports = route;
