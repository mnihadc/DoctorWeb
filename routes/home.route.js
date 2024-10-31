const express = require("express");
const {
  getHome,
  getDoctor,
  getDoctorDetails,
} = require("../controllers/home.controller");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.get("/", getHome);
router.get("/doctor", getDoctor);
router.get("/getdoctor/:doctorName", verifyToken, getDoctorDetails);

module.exports = router;
