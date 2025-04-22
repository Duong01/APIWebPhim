require("dotenv").config();
const cors = require('cors');
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.routes");
const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
