const express = require("express");
const {
  getHome,
  getDoctor,
  Booking,
} = require("../controllers/home.controller");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.get("/", getHome);
router.get("/doctor", getDoctor);
router.get("/booking/:doctorName", verifyToken, Booking);

module.exports = router;
