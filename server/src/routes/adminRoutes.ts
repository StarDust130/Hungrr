import { Router } from "express";
import { createCafe, createCategory, createMenuItem, deleteCategory, deleteMenuItem, getCafeByOwnerId, getCategoriesByCafe, getDashboardSummary, getMenuItemsByCafe, getOrdersByCafe, getTodayAISummary, toggleMenuItemAvailability, updateCafe, updateCategory, updateMenuItem, updateOrderStatus } from "../controllers/adminController";


const router = Router();

//! 1) 📋 Cafe Admin Panel Routes
router.get("/cafe/owner/:ownerId", getCafeByOwnerId as any); // 🔍 Get cafe by owner ID
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


//! 4) Category Management Routes
router.get("/category/cafe/:cafeId", getCategoriesByCafe as any); // 🔍 Get all categories for a specific cafe
router.post("/category", createCategory as any); // ➕ Create a new category
router.patch("/category/:categoryId", updateCategory as any); // ✏️ Update an existing category
router.delete("/category/:categoryId", deleteCategory as any); // ❌ Delete a category (SOFT DELETE)


//! 5) Admin Dashboard Routes
router.get("/summary/:cafeId", getDashboardSummary as any); // 🔍 Get dashboard summary for a specific cafe
router.get("/summary/ai/:cafeId", getTodayAISummary as any); // 🔍 Get dashboard summary for a specific cafe









export default router;