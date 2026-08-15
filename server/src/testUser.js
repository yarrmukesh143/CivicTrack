require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

const testUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected ✅");

    const user = await User.create({
      name: "CivicTrack Test User",
      email: "test@civictrack.com",
      password: "testpassword123",
      role: "citizen",
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716],
      },
    });

    console.log("User created successfully ✅");
    console.log(user);

    await mongoose.disconnect();
    console.log("MongoDB disconnected ✅");
  } catch (error) {
    console.error("Test failed ❌");
    console.error(error.message);
  }
};

testUser();
