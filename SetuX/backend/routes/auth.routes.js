const express = require("express");

const {
  signup,
  login,
  adminLogin,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/admin-login", adminLogin);

module.exports = router;