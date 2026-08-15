
const Issue = require("../models/Issue");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const createIssue = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    // Basic validation
    if (!title || !description || !category || !req.body.location) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category and location are required",
      });
    }

    // 📍 Parse location from FormData
    let location;

    try {
      location = JSON.parse(req.body.location);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid location format",
      });
    }

    // 📍 Validate location
    if (
      !location ||
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid location data",
      });
    }

    // 📸 Upload image if provided
    let imageUrl = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    // Create issue
    const issue = await Issue.create({
      title,
      description,
      category,
      location,
      reportedBy: req.user.userId,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Issue created successfully ✅",
      issue,
    });
  } catch (error) {
    console.error("Create issue error ❌", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating issue",
    });
  }
};

// Get all issues
const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Get all issues error ❌", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching issues",
    });
  }
};

const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate(
      "reportedBy",
      "name email",
    );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    console.error("Get issue by ID error ❌", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching issue",
    });
  }
};

// Get nearby issues
const getNearbyIssues = async (req, res) => {
  try {
    const { lng, lat, distance = 5000 } = req.query;

    // Validate coordinates
    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: "Longitude and latitude are required",
      });
    }

    const longitude = Number(lng);
    const latitude = Number(lat);
    const maxDistance = Number(distance);

    // Validate numbers
    if (
      Number.isNaN(longitude) ||
      Number.isNaN(latitude) ||
      Number.isNaN(maxDistance)
    ) {
      return res.status(400).json({
        success: false,
        message: "Longitude, latitude and distance must be valid numbers",
      });
    }

    // Find issues near given location
    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      },
    })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Get nearby issues error ❌", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching nearby issues",
    });
  }
};


const upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    const userId = req.user._id;

    // Check if this user already upvoted
    const alreadyUpvoted = issue.upvotedBy?.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyUpvoted) {
      return res.status(400).json({
        success: false,
        message: "You have already upvoted this issue",
        upvotes: issue.upvotes,
      });
    }

    // Add user to upvoters
    issue.upvotedBy.push(userId);

    // Increase count
    issue.upvotes += 1;

    await issue.save();

    return res.status(200).json({
      success: true,
      message: "Issue upvoted successfully 👍",
      upvotes: issue.upvotes,
    });
  } catch (error) {
    console.error("Upvote issue error ❌", error);

    return res.status(500).json({
      success: false,
      message: "Server error while upvoting issue",
    });
  }
};

// Update issue status - Official only
const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Reported",
      "Under Review",
      "In Progress",
      "Resolved",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    issue.status = status;

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Issue status updated successfully ✅",
      issue,
    });
  } catch (error) {
    console.error("Update issue status error ❌", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating issue status",
    });
  }
};

// Update issue department - Official only
const updateIssueDepartment = async (req, res) => {
  try {
    const { department } = req.body;

    const allowedDepartments = [
      "Road Department",
      "Sanitation Department",
      "Water Department",
      "Electricity Department",
      "General Administration",
    ];

    if (!department || !allowedDepartments.includes(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department",
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    issue.assignedDepartment = department;

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Issue department updated successfully ✅",
      issue,
    });
  } catch (error) {
    console.error("Update issue department error ❌", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating issue department",
    });
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  getNearbyIssues,
  upvoteIssue,
  updateIssueStatus,
  updateIssueDepartment,
};
