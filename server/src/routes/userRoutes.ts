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
router.get("/cafe_banner/:slug", getCafeInfoBySlug); // ✅ OK
router.get("/menu/:slug", getCafeMenu as any); // ✅ OK
router.get("/menu/category/:slug", getCategory as any); // ✅ OK

//! Orders
router.get("/orders/active/:cafeId/:tableNo", getActiveOrdersForTable as any); // ✅ OK

//! Bill Page 📜
router.get("/bill/:publicId", getBillByPublicId as any); // ✅ OK
router.post("/bill", upsertBill as any); // ✅ OK
router.delete("/orders/:publicId", cancelPendingOrder as any); // ✅ OK

export default router;
