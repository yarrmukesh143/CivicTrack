require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");
const Issue = require("./models/Issue");
const Comment = require("./models/Comment");

const testComment = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected ✅");

    const user = await User.findOne({
      email: "issuetest@civictrack.com",
    });

    const issue = await Issue.findOne({
      title: "Broken street light",
    });

    if (!user || !issue) {
      console.log("Test user or issue not found ❌");
      return;
    }

    const comment = await Comment.create({
      issue: issue._id,
      author: user._id,
      text: "This issue has been received and is under review.",
    });

    console.log("Comment created successfully ✅");
    console.log(comment);

    await mongoose.disconnect();

    console.log("MongoDB disconnected ✅");
  } catch (error) {
    console.error("Comment test failed ❌");
    console.error(error.message);
  }
};

testComment();
