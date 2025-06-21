// src/routes/cafeRoutes.ts
import { Router } from "express";
import {
  completePayment,
  getBillInfo,
  getCafeInfoBySlug,
  getCafeMenu,
  getCategory,
  upsertBill,
} from "../controllers/cafeController";

const router = Router();

router.get("/cafe_banner/:slug", getCafeInfoBySlug);

router.get("/menu/:slug/", getCafeMenu as any);
router.get("/menu/category/:slug/", getCategory as any);

router.post("/bill", upsertBill as any);       // Create or update order (add items)
router.patch("/bill/complete", completePayment);  // Finalize payment & bill


router.get("/bill/:cafeKey/:tableNo", getBillInfo as any); 



export default router;
