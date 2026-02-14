import express from "express";
import {
  createBug,
  getBugs,
  getBugById,
} from "../controllers/bugController.js";
import { protect, isCompany } from "../middleware/authMiddleware.js";
import { submitSolution } from "../controllers/submissionController.js";

const router = express.Router();

// All bugs view (public route)
router.get("/", getBugs);

// Bug Creation (Only for Companies)
router.post("/", protect, isCompany, createBug);

router.get("/:id", getBugById); // specific bug details view (public route)

router.post("/submit", protect, submitSolution); // for Solution submit by Developers/users

export default router;
