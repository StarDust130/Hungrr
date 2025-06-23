// src/routes/cafeRoutes.ts
import { Router } from "express";
import {
  completeOrderPayment,
  getActiveOrdersForTable,
  getBillByPublicId,
  getBillInfo,
  getCafeInfoBySlug,
  getCafeMenu,
  getCategory,
  updateOrderStatus,
  upsertBill,
} from "../controllers/cafeController";

const router = Router();

router.get("/cafe_banner/:slug", getCafeInfoBySlug);

router.get("/menu/:slug/", getCafeMenu as any);
router.get("/menu/category/:slug/", getCategory as any);

router.post("/bill", upsertBill as any);       // Create or update order (add items)
router.patch("/bill/complete", completeOrderPayment as any);


router.get("/bill/:publicId", getBillByPublicId as any);
router.get("/bill/:cafeKey/:tableNo", getBillInfo as any); 
router.get("/orders/active/:cafeId/:tableNo", getActiveOrdersForTable as any);

router.patch("/order/:orderId/status", updateOrderStatus as any);


export default router;
