const express = require("express");

const {
  createComment,
  getIssueComments,
} = require("../controllers/commentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add comment
router.post("/:issueId", protect, createComment);

// Get comments
router.get("/:issueId", getIssueComments);

module.exports = router;
