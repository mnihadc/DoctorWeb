const express = require("express");
const { getHome, getDoctor } = require("../controllers/home.controller");
const router = express.Router();

router.get("/", getHome);
router.get("/doctor", getDoctor);

module.exports = router;
