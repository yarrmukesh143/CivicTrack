require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");
const Issue = require("./models/Issue");

const testIssue = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected ✅");

    // Temporary test user
    const user = await User.create({
      name: "Issue Test User",
      email: "issuetest@civictrack.com",
      password: "testpassword123",
      role: "citizen",
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716],
      },
    });

    console.log("Test user created ✅");

    // Test issue
    const issue = await Issue.create({
      title: "Broken street light",
      description: "Street light is not working near the main road.",
      category: "electricity",
      photoUrl: "",
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716],
      },
      reportedBy: user._id,
    });

    console.log("Test issue created successfully ✅");
    console.log(issue);

    await mongoose.disconnect();

    console.log("MongoDB disconnected ✅");
  } catch (error) {
    console.error("Test failed ❌");
    console.error(error.message);
  }
};

testIssue();
