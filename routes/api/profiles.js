const express = require("express");
const router = express.Router();

// @route 	GET /api/profile/test
// @desc   Test proifile route 
// @access Public
router.get('/test', (req, res) => res.json({blah: "blah", crazy: "Profile Works"}) );

module.exports = router;