// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";

//! Cafe Banner 🤑
export const getCafeInfoBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { slug } = req.params;

  try {
    const cafe = await prisma.cafe.findFirst({
      where: {
        slug,
        is_active: true,
      },
    });

    if (!cafe) {
      res.status(404).json({ success: false, message: "Cafe not found" });
    } else {
      res.json({ success: true, data: cafe });
    }
  } catch (error) {
    console.error("Error in getCafeInfoBySlug:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//! Cafe Menu 😋
export const getCafeMenu = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { slug } = req.params;

    const cafe = await prisma.cafe.findFirst({
      where: {
        slug,
        is_active: true,
      },
    });

    if (!cafe) {
      return res.status(404).json({ detail: "Cafe not found" });
    }

    const items = await prisma.menuItem.findMany({
      where: {
        cafeId: cafe.id,
        is_active: true,
      },
      include: {
        category: true,
      },
    });

    const grouped: Record<string, any[]> = {};
    for (const item of items) {
      if (item.category && item.category.name) {
        const catName = item.category.name;
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(item);
      }
    }

    const categories = Object.keys(grouped).sort();
    const categoryIndex = parseInt(req.query.category_index as string) || 0;

    if (categoryIndex >= categories.length) {
      return res.status(204).json({});
    }

    const categoryName = categories[categoryIndex];
    if (categoryIndex >= categories.length) {
      return res.status(204).json({});
    }

    return res.json({
      [categoryName]: grouped[categoryName],
      hasMore: categoryIndex + 1 < categories.length,
    });
    
  } catch (err: any) {
    console.error("Error in getCafeMenu:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
};

