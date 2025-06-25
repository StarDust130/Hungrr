import { Router } from "express";
import { updateOrderStatus } from "../controllers/adminController";


const router = Router();



//! Admin Panel PATCH Order Status 📦 (Live Status of Order)
router.patch("/order/:orderId/status", updateOrderStatus as any);



export default router;