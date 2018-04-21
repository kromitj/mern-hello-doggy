const express = require("express");
const router = express.Router();

router.get('/test', (req, res) => res.json({blah: "blah", crazy: "Shelter Works"}) );

module.exports = router;