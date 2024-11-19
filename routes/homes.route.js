const express = require("express");
const { getHome, getAbout } = require("../controllers/home.controller");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.get("/", verifyToken, getHome);
router.get("/about", getAbout);

module.exports = router;
