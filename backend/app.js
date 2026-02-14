import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import bugRoutes from "./routes/bugRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Basic Route
app.get("/", (req, res) => {
  res.send("Bug Bounty API is running...");
});
app.use("/api/auth", authRoutes); // Authentication related routes
app.use("/api/bugs", bugRoutes); // Bug related routes
app.use("/api/submissions", submissionRoutes); // Submission related routes

const PORT = process.env.PORT || 5000;

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () =>
      console.log(`Server started on http://localhost:${PORT}`),
    );
  })
  .catch((err) => console.log(err));
