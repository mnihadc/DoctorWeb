const express = require("express");
const { getHome, getAbout } = require("../controllers/home.controller");
const router = express.Router();

router.get("/", getHome);
router.get("/about", getAbout);

module.exports = router;
