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

router.get("/menu/:slug/", getCafeMenu);
router.get("/menu/category/:slug/", getCategory);

router.post("/bill", upsertBill);       // Create or update order (add items)
router.patch("/bill/complete", completePayment);  // Finalize payment & bill


router.get("/bill/:cafeSlug/:tableNo", getBillInfo);  // Finalize payment & bill



export default router;
