require("dotenv").config();

const mongoose = require("mongoose");
const Issue = require("./models/Issue");

const createIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected ✅");

    await Issue.createIndexes();

    console.log("Issue indexes created successfully ✅");

    const indexes = await Issue.collection.indexes();

    console.log("Current indexes:");
    console.log(indexes);

    await mongoose.disconnect();

    console.log("MongoDB disconnected ✅");
  } catch (error) {
    console.error("Index creation failed ❌");
    console.error(error.message);
  }
};

createIndex();
