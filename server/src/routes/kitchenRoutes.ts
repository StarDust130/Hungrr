import { Router } from "express";

import { completeCooking, serveOrder, setPrepTime ,getOrders } from "../controllers/kitchen/kitchenController";

const router = Router();


router.get("/orders", getOrders as any);

// Set preparation time and start cooking
router.patch("/orders/:id/prep-time", setPrepTime as any);

// Complete cooking
router.patch("/orders/:id/complete-cooking", completeCooking);

// Mark order as served
router.patch("/orders/:id/serve", serveOrder);

export default router;
