import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} from "../controllers/foodController.js";

const router = express.Router();

router.get("/", getFoods);
router.get("/:id", getFoodById);
router.post("/", protect, admin, createFood);
router.put("/:id", protect, admin, updateFood);
router.delete("/:id", protect, admin, deleteFood);

export default router;
