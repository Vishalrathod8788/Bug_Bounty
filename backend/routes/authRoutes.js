import express from "express";
import {
  registerUser,
  loginUser,
  addBalance,
  getUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/add-balance", protect, addBalance);
router.get("/profile", protect, getUserProfile);

export default router;
