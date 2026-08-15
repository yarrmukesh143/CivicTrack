const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    category: {
      type: String,
      enum: ["road", "garbage", "water", "electricity", "other"],
      required: true,
    },

    // 📍 GeoJSON location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    // 📸 Cloudinary image URL
    imageUrl: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["Reported", "Under Review", "In Progress", "Resolved"],
      default: "Reported",
    },

    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedDepartment: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// 🌍 Geospatial index
issueSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Issue", issueSchema);
