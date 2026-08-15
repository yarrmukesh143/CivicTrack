require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
  },
});

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected to Socket.io ⚡", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected ❌", socket.id);
  });
});

// Connect MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("CivicTrack API is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

// Error handler — LAST
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`CivicTrack server running on http://localhost:${PORT}`);
});
