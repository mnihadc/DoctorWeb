const express = require("express");

const verifyToken = require("../middleware/verifyToken");
const {
  getDoctor,
  getDoctorDetails,
  TokenBooking,
  getTokenPage,
  getHistoryToken,
} = require("../controllers/doctor.controller");
const router = express.Router();

router.get("/doctor", getDoctor);
router.get("/getdoctor/:doctorName", verifyToken, getDoctorDetails);
router.post("/booking", verifyToken, TokenBooking);
router.get("/get-token", verifyToken, getTokenPage);
router.get("/get-history-token", verifyToken, getHistoryToken);

module.exports = router;
