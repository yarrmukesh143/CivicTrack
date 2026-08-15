const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// =========================
// SIGNUP
// =========================
const signup = async (req, res) => {
  try {
    // IMPORTANT:
    // role bhi request se receive karna hai
    const { name, email, password, role } = req.body;

    console.log("========== SIGNUP ==========");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Role:", role);
    console.log("============================");

    // 1. Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    // 2. Validate role
    if (!["citizen", "official"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Choose citizen or official.",
      });
    }

    // 3. Clean values
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 4. Validate name
    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters",
      });
    }

    // 5. Validate password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    // 6. Check existing user
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // 7. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8. Create user
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: role,
    });

    console.log("USER CREATED:");
    console.log({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // 9. Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // 10. Send response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error ❌", error);

    return res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
};

// =========================
// LOGIN
// =========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Clean email
    const cleanEmail = email.trim().toLowerCase();

    // 3. Find user
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 5. Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    console.log("========== LOGIN ==========");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("============================");

    // 6. Send response
    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error ❌", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// =========================
// EXPORT
// =========================
module.exports = {
  signup,
  login,
};
