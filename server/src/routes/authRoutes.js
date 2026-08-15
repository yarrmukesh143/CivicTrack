const express = require("express");

const { signup, login } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected test route
router.get("/protected-test", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated ✅",
    user: req.user,
  });
});

module.exports = router;
