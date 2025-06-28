import { Router } from "express";
import { createCafe, getCafeByOwnerId, updateCafe, updateOrderStatus } from "../controllers/adminController";


const router = Router();

//! 📋 Cafe Admin Panel Routes


router.get("/cafe/owner/:ownerId", getCafeByOwnerId as any); // 🔍 Get cafe by owner ID
router.post("/cafe", createCafe as any);  // ➕ Create a new cafe (used during onboarding)
router.patch("/cafe/:ownerId", updateCafe as any); // ✏️ Update existing cafe for an owner





//! Admin Panel PATCH Order Status 📦 (Live Status of Order)
router.patch("/order/:orderId/status", updateOrderStatus as any);




export default router;