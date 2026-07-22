const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// =======================
// Environment Variables
// =======================
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || "http://localhost:3000";

// =======================
// Middleware
// =======================
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// =======================
// Socket.IO
// =======================
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true
  }
});

// =======================
// MongoDB Connection
// =======================
mongoose.connect(
  process.env.MONGODB_URI || process.env.MONGO_URI
)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// =======================
// Routes
// =======================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// =======================
// Home Route
// =======================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Chat API is Running 🚀"
  });
});

// =======================
// Health Check
// =======================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

// =======================
// Socket Handler
// =======================
require("./socket/socketHandler")(io);

// =======================
// Start Server
// =======================
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});