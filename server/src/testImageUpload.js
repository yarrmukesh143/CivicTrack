require("dotenv").config();

const fs = require("fs");
const path = require("path");

const cloudinary = require("./config/cloudinary");

const testImage = path.join(__dirname, "../test-image.png");

if (!fs.existsSync(testImage)) {
  console.error("❌ test-image.png not found");
  process.exit(1);
}

console.log("Image found ✅");

cloudinary.uploader.upload(
  testImage,
  {
    folder: "civictrack/test",
  },
  (error, result) => {
    if (error) {
      console.error("Cloudinary upload failed ❌");
      console.error(error);
      process.exit(1);
    }

    console.log("Cloudinary upload successful ✅");
    console.log("Image URL:", result.secure_url);
    console.log("Public ID:", result.public_id);
  },
);
