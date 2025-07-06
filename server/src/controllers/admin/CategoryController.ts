import { Request, Response } from "express";
import prisma from "../../config/prisma";

//! ) 🧾 Category Controllers (CRUD)

// 1)Get All Categories for a Cafe
export const getCategoriesByCafe = async (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;

    if (!cafeId) {
      return res.status(400).json({ message: "🚫 Cafe ID is required." });
    }

    const categories = await prisma.category.findMany({
      where: { cafeId: Number(cafeId) },
      orderBy: { order: "asc" }, // Sorts by the custom order
    });

    // ✅ FIXED: Return an object with a `categories` key to match the frontend call
    return res.status(200).json({
      message: "📦 Categories fetched successfully!",
      categories: categories,
    });
  } catch (err: any) {
    console.error("❌ Error in getCategoriesByCafe:", err.message || err);
    return res
      .status(500)
      .json({ message: "🚨 Server error fetching categories." });
  }
};
// 2) Create a new Category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, cafeId } = req.body;

    // 1️⃣ Validate
    if (!name || !cafeId) {
      return res.status(400).json({ message: "🚫 Required: name and cafeId." });
    }

    const numericCafeId = Number(cafeId);

    // 2️⃣ Prevent duplicate name in same cafe (existing logic is good)
    const existing = await prisma.category.findFirst({
      where: { name, cafeId: numericCafeId },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "⚠️ Category name already exists for this cafe." });
    }

    // ✨ 3️⃣ Get the highest current order number for this cafe
    const lastCategory = await prisma.category.findFirst({
      where: { cafeId: numericCafeId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastCategory ? (lastCategory.order ?? -1) + 1 : 0;

    // 4️⃣ Create category with the new order
    const newCategory = await prisma.category.create({
      data: {
        name,
        cafeId: numericCafeId,
        order: newOrder, // ✨ Assign the order
      },
    });

    // 5️⃣ Respond
    return res.status(201).json({
      message: "✅ Category created successfully!",
      category: newCategory,
    });
  } catch (err: any) {
    console.error("❌ Error in createCategory:", err.message || err);
    return res
      .status(500)
      .json({ message: "🚨 Server error creating category." });
  }
};

// 3) Update an existing Category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    // 1️⃣ Validate input
    if (!name) {
      return res.status(400).json({ message: "🚫 Category name is required." });
    }

    // 2️⃣ Update category
    const updated = await prisma.category.update({
      where: { id: Number(categoryId) },
      data: { name },
    });

    // 3️⃣ Respond
    return res.status(200).json({
      message: "✏️ Category updated successfully!",
      category: updated,
    });
  } catch (err: any) {
    console.error("❌ Error in updateCategory:", err.message || err);
    return res
      .status(500)
      .json({ message: "🚨 Server error updating category." });
  }
};

// 4) Delete a Category (Soft Delete)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    // 1️⃣ Delete category (also deletes related menu items due to cascade)
    await prisma.category.delete({
      where: { id: Number(categoryId) },
    });

    // 2️⃣ Respond
    return res
      .status(200)
      .json({ message: "🗑️ Category deleted successfully!" });
  } catch (err: any) {
    console.error("❌ Error in deleteCategory:", err.message || err);
    return res
      .status(500)
      .json({ message: "🚨 Server error deleting category." });
  }
};

// ✨ 5) Update the order of all Categories for a Cafe
export const updateCategoryOrder = async (req: Request, res: Response) => {
  try {
    const { orderedCategories } = req.body;

    if (!Array.isArray(orderedCategories) || orderedCategories.length === 0) {
      return res
        .status(400)
        .json({ message: "🚫 Category order data is required." });
    }

    // Use a transaction to ensure all updates succeed or none do
    const updatePromises = orderedCategories.map(
      (cat: { id: number; order: number }) =>
        prisma.category.update({
          where: { id: cat.id },
          data: { order: cat.order },
        })
    );

    await prisma.$transaction(updatePromises);

    return res
      .status(200)
      .json({ message: "🔄 Category order updated successfully!" });
  } catch (err: any) {
    console.error("❌ Error in updateCategoryOrder:", err.message || err);
    return res
      .status(500)
      .json({ message: "🚨 Server error updating category order." });
  }
};
