const express = require("express");
const {
  dashboard,
  updateUser,
  deleteUser,
} = require("../controllers/admin.controller");
const verifyToken = require("../middleware/verifyToken");
const route = express.Router();

route.get("/dashboard", verifyToken, dashboard);
route.put("/update-user/:id", verifyToken, updateUser);
route.delete("/delete-user/:id", verifyToken, deleteUser);

module.exports = route;
