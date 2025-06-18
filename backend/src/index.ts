import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import columnRoutes from "./routes/columns";
import taskRoutes from "./routes/tasks";
import authRoutes from "./routes/auth";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.DATABASE_URL, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
    console.log("Database name:", mongoose.connection.db.databaseName);
    console.log("Connection ready state:", mongoose.connection.readyState);
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Connection string:", process.env.DATABASE_URL);
  });

// Add connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

app.get("/", (req, res) => {
  res.json({ message: "Kanban API Server" });
});


app.use("/api/auth", authRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
