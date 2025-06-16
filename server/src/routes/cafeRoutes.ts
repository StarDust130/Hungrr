// src/routes/cafeRoutes.ts
import { Router } from "express";
import { getCafeInfoBySlug } from "../controllers/cafeController";

const router = Router();

router.get("/:slug", getCafeInfoBySlug);

export default router;
