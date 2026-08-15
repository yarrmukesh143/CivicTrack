const express = require("express");

const validate = require("../middleware/validationMiddleware");
const upload = require("../middleware/uploadMiddleware");

const { createIssueValidation } = require("../validators/issueValidator");

const {
  createIssue,
  getAllIssues,
  getIssueById,
  getNearbyIssues,
  upvoteIssue,
  updateIssueStatus,
  updateIssueDepartment,
} = require("../controllers/issueController");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// Citizen: Create issue + optional image
router.post(
  "/",
  protect,
  upload.single("image"),
  createIssueValidation,
  validate,
  createIssue,
);

// Public: Get all issues
router.get("/", getAllIssues);

// Public: Get nearby issues
router.get("/nearby", getNearbyIssues);

// Public: Get single issue
router.get("/:id", getIssueById);

// Logged-in user: Upvote
router.post("/:id/upvote", protect, upvoteIssue);

// Official only: Update status
router.patch(
  "/:id/status",
  protect,
  requireRole("official"),
  
);
// Official only: Update status
router.patch(
  "/:id/status",
  protect,
  requireRole("official"),
  updateIssueStatus,
);

// Official only: Update department
router.patch(
  "/:id/department",
  protect,
  requireRole("official"),
  updateIssueDepartment,
);

module.exports = router;
