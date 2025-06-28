import { Router } from "express";
import { createCafe, getCafeByOwnerId, updateOrderStatus } from "../controllers/adminController";


const router = Router();

//! Cafe Admin Panel Routes 📋
router.get("/cafe/:ownerId", getCafeByOwnerId as any); // Get Cafe info for Cafe Owner
router.post("/cafe/create", createCafe as any); // Get Cafe info for Cafe Owner





//! Admin Panel PATCH Order Status 📦 (Live Status of Order)
router.patch("/order/:orderId/status", updateOrderStatus as any);




export default router;