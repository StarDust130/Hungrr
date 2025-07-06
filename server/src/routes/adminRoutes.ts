import { Router } from "express";
import {
  createCafe,
  getCafeByOwnerId,
  getCafeNameandLogoURL,
  updateCafe,
} from "../controllers/admin/cafeController";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItemsByCafe,
  getMenuStats,
  getUnavailableMenuItemsByCafe,
  hardDeleteMenuItem,
  reactivateMenuItem,
  toggleMenuItemAvailability,
  updateMenuItem,
} from "../controllers/admin/menuController";
import { getCafeStats, getOrderDetails, getOrdersByCafe, markOrderAsPaid, updateOrderStatus } from "../controllers/admin/OrderController";
import { bulkSaveAIMenu, processMenuWithAI } from "../controllers/admin/aiMenuController";
import { createCategory, deleteCategory, getCategoriesByCafe, updateCategory, updateCategoryOrder } from "../controllers/admin/CategoryController";
import { getDashboardSummary, getTodayAISummary, getTodayDashboardData } from "../controllers/admin/DashboardController";

const router = Router();

//! ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ☕ Cafe Routes
router.get("/cafe/owner/:ownerId", getCafeByOwnerId as any); // 🔍 By owner
router.get("/cafe/name/:ownerId", getCafeNameandLogoURL as any); // 🏷️ Name & logo
router.post("/cafe", createCafe as any); // ➕ New cafe
router.patch("/cafe/:ownerId", updateCafe as any); // ✏️ Update cafe

//! ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 📦 Order Routes
router.get("/stats/cafe/:cafeId", getCafeStats); // 📊 Cafe stats
router.get("/orders/cafe/:cafeId", getOrdersByCafe as any); // 📋 All orders
router.get("/order/:orderId/details", getOrderDetails as any); // 🔍 Order details
router.patch("/order/:orderId/status", updateOrderStatus as any); // 🔄 Update status
router.patch("/order/:orderId/mark-paid", markOrderAsPaid as any); // 💰 Mark as paid

//! ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 🍔 Menu Routes
router.get("/menu/cafe/:cafeId", getMenuItemsByCafe as any); // 📋 All menu items
router.post("/menu", createMenuItem as any); // ➕ New menu item
router.patch("/menu/:itemId", updateMenuItem as any); // ✏️ Update item
router.delete("/menu/:itemId", deleteMenuItem as any); // ❌ Soft delete
router.patch("/menu/:itemId/toggle-availability", toggleMenuItemAvailability as any); // 🔄 Toggle availability
router.get("/stats/menu/:cafeId", getMenuStats as any); // 📊 Menu stats
router.get("/menu/cafe/:cafeId/unavailable", getUnavailableMenuItemsByCafe as any); // 🚫 Unavailable items
router.patch("/menu/:itemId/reactivate", reactivateMenuItem as any); // ♻️ Reactivate item
router.delete("/menu/:itemId/permanent", hardDeleteMenuItem as any); // 🗑️ Hard delete
router.post("/menu/ai-upload", processMenuWithAI as any); // 🤖 AI menu upload
router.post("/menu/ai-bulk-save", bulkSaveAIMenu as any); // 💾 AI bulk save

//! ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 🗂️ Category Routes
router.get("/category/cafe/:cafeId", getCategoriesByCafe as any); // 📋 All categories
router.post("/category", createCategory as any); // ➕ New category
router.patch("/category/:categoryId", updateCategory as any); // ✏️ Update category
router.put("/categories/order", updateCategoryOrder as any); // 🔀 Reorder categories
router.delete("/category/:categoryId", deleteCategory as any); // ❌ Delete category

//! ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 📊 Dashboard Routes
router.get("/summary/:cafeId", getDashboardSummary as any); // 📈 Summary
router.get("/summary/ai/:cafeId", getTodayAISummary as any); // 🤖 AI summary
router.get("/dashboard/:cafeId/today", getTodayDashboardData as any); // 📅 Today data

export default router;
