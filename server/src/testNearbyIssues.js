require("dotenv").config();

const mongoose = require("mongoose");
const Issue = require("./models/Issue");

const testNearbyIssues = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected ✅");

    const longitude = 77.5946;
    const latitude = 12.9716;

    const nearbyIssues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 5000,
        },
      },
    });

    console.log(`Found ${nearbyIssues.length} nearby issue(s) 📍`);

    nearbyIssues.forEach((issue) => {
      console.log({
        title: issue.title,
        category: issue.category,
        status: issue.status,
        location: issue.location,
      });
    });

    await mongoose.disconnect();

    console.log("MongoDB disconnected ✅");
  } catch (error) {
    console.error("Nearby issue test failed ❌");
    console.error(error.message);
  }
};

testNearbyIssues();
