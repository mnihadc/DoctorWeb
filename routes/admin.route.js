const express = require("express");
const {
  dashboard,
  updateUser,
  deleteUser,
  createUser,
} = require("../controllers/admin.controller");
const verifyToken = require("../middleware/verifyToken");
const { isAdmin } = require("../middleware/isAdmin");
const route = express.Router();

route.get("/dashboard", verifyToken, isAdmin, dashboard);
route.put("/update-user/:id", verifyToken, isAdmin, updateUser);
route.delete("/delete-user/:id", verifyToken, deleteUser);
route.post("/create-user", verifyToken, createUser);


module.exports = route;
