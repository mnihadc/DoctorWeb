const express = require("express");
const {
  getHome,
  getDoctor,
  getDoctorDetails,
  getAbout,
  TokenBooking,
  getTokenPage,
} = require("../controllers/home.controller");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.get("/", getHome);
router.get("/doctor", getDoctor);
router.get("/getdoctor/:doctorName", verifyToken, getDoctorDetails);
router.get("/about", getAbout);
router.post("/booking", verifyToken, TokenBooking);
router.get("/get-token", verifyToken, getTokenPage);

module.exports = router;
