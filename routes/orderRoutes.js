import express from "express";
import { addOrderItems } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "Orders endpoint is working!" });
});

router.post("/", protect, addOrderItems);

export default router;