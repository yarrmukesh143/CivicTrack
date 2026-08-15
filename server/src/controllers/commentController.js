const Comment = require("../models/Comment");
const Issue = require("../models/Issue");

// Create comment
const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { issueId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    const comment = await Comment.create({
      issue: issueId,
      user: req.user.userId,
      text: text.trim(),
    });

    const populatedComment = await comment.populate("user", "name email role");

    res.status(201).json({
      success: true,
      message: "Comment added successfully 💬",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error ❌", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating comment",
    });
  }
};

// Get comments for an issue
const getIssueComments = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    const comments = await Comment.find({ issue: issueId })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Get comments error ❌", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching comments",
    });
  }
};

module.exports = {
  createComment,
  getIssueComments,
};
