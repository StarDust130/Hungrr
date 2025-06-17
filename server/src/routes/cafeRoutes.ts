// src/routes/cafeRoutes.ts
import { Router } from "express";
import {
  getCafeInfoBySlug,
  getCafeMenu,
  getCategory,
} from "../controllers/cafeController";

const router = Router();

router.get("/cafe_banner/:slug", getCafeInfoBySlug);

router.get("/menu/:slug/", getCafeMenu);
router.get("/menu/category/:slug/", getCategory);

export default router;
