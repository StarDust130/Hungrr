import { Router } from "express";
import {
  createCafe,
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  getCafeByOwnerId,
  getCafeNameandLogoURL,
  getCategoriesByCafe,
  getDashboardSummary,
  getMenuItemsByCafe,
  getOrdersByCafe,
  getTodayAISummary,
  toggleMenuItemAvailability,
  updateCafe,
  updateCategory,
  updateMenuItem,
  updateOrderStatus,
  getMenuStats,
  reactivateMenuItem,
  hardDeleteMenuItem,
  getUnavailableMenuItemsByCafe,
  updateCategoryOrder,
} from "../controllers/adminController";
import { bulkSaveAIMenu, processMenuWithAI } from "../controllers/aiMenuController";


const router = Router();

//! 1) 📋 Cafe Admin Panel Routes
router.get("/cafe/owner/:ownerId", getCafeByOwnerId as any); // 🔍 Get cafe by owner ID
router.get("/cafe/name/:ownerId", getCafeNameandLogoURL as any); // 🔍 Get cafe name 
router.post("/cafe", createCafe as any);  // ➕ Create a new cafe (used during onboarding)
router.patch("/cafe/:ownerId", updateCafe as any); // ✏️ Update existing cafe for an owner

//! 2) Order Management Routes
router.get("/orders/cafe/:cafeId", getOrdersByCafe as any); // 🔍 Get all orders for a specific cafe
router.patch("/order/:orderId/status", updateOrderStatus as any); // ✏️ (Live Status of Order) 


//! 3) Order Status Management
router.get("/menu/cafe/:cafeId", getMenuItemsByCafe as any); // 🔍 Get all menu items for a specific cafe
router.post("/menu", createMenuItem as any); // ➕ Create a new menu item
router.patch("/menu/:itemId", updateMenuItem as any); // ✏️ Update an existing menu item
router.delete("/menu/:itemId", deleteMenuItem as any); // ❌ Delete a menu item(SOFT DELETE)
router.patch("/menu/:itemId/toggle-availability", toggleMenuItemAvailability as any); // 🔄 Toggle availability of a menu item
router.get("/stats/menu/:cafeId", getMenuStats as any); // 📊 Get all menu stats for a cafe
router.get(
  "/menu/cafe/:cafeId/unavailable",
  getUnavailableMenuItemsByCafe as any
);
router.patch("/menu/:itemId/reactivate", reactivateMenuItem as any);
router.delete("/menu/:itemId/permanent", hardDeleteMenuItem as any);

// Route to process the menu image with AI
router.post('/menu/ai-upload', processMenuWithAI as any); // 🔄 Process menu image with AI

// Route to save the processed data
router.post('/menu/ai-bulk-save', bulkSaveAIMenu as any); // ➕ Save AI-generated menu data in bulk

//! 4) Category Management Routes
router.get("/category/cafe/:cafeId", getCategoriesByCafe as any); // 🔍 Get all categories for a specific cafe
router.post("/category", createCategory as any); // ➕ Create a new category
router.patch("/category/:categoryId", updateCategory as any); // ✏️ Update an existing category
router.put("/categories/order", updateCategoryOrder as any); //
router.delete("/category/:categoryId", deleteCategory as any); // ❌ Delete a category (SOFT DELETE)


//! 5) Admin Dashboard Routes
router.get("/summary/:cafeId", getDashboardSummary as any); // 🔍 Get dashboard summary for a specific cafe
router.get("/summary/ai/:cafeId", getTodayAISummary as any); // 🔍 Get dashboard summary for a specific cafe









export default router;