// src/routes/cafeRoutes.ts
import { Router } from "express";
import {
  getActiveOrdersForTable,
  getBillByPublicId,
  getCafeInfoBySlug,
  getCafeMenu,
  getCategory,
  upsertBill,
  cancelPendingOrder,
} from "../controllers/user/userController";

const router = Router();

//! Menu Page 🍀
router.get("/cafe_banner/:slug", getCafeInfoBySlug);
router.get("/menu/:slug", getCafeMenu as any);
router.get("/menu/category/:slug", getCategory as any);

router.get("/orders/active/:cafeId/:tableNo", getActiveOrdersForTable as any);

//! Bill Page 📜
router.get("/bill/:publicId", getBillByPublicId as any);

router.post("/bill", upsertBill as any); // Create or update order (add items)

router.delete("/orders/:publicId", cancelPendingOrder as any); // Cancel pending order

export default router;
