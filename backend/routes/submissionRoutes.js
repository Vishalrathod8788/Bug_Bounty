import express from "express";
import {
  submitSolution,
  approveSubmission,
  getSubmissionsForBug,
  rejectSubmission,
} from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit Solution (Only for Developers/Users)
router.post("/submit", protect, submitSolution);

// Get Submissions for a Bug
router.get("/bug/:bugId", getSubmissionsForBug);

// Approve Submission (Only for Company/Bug Creator)
router.put("/approve/:id", protect, approveSubmission);

// Reject Submission (Only for Company/Bug Creator)
router.put("/reject/:id", protect, rejectSubmission);

export default router;
