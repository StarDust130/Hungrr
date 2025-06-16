// src/routes/cafeRoutes.ts
import { Router } from "express";
import { getCafeInfoBySlug, getCafeMenu } from "../controllers/cafeController";

const router = Router();

router.get("/:slug", getCafeInfoBySlug);
router.get("/menu/:slug/", getCafeMenu);

export default router;
