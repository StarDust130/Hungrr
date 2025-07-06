// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../../config/prisma";

//! 3) Menu Management (Get ,Add, Update, Delete) 🍽️

// 3.1) Get Menu Items by Cafe ID
// This endpoint fetches menu items for a specific cafe with pagination and optional search/filtering.
export const getMenuItemsByCafe = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Extract query params
    const { cafeId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const search = req.query.search as string;
    const categoryId = parseInt(req.query.categoryId as string) || undefined;

    // 2️⃣ Validate cafeId
    if (!cafeId) {
      return res.status(400).json({ message: "🚫 Cafe ID is required." });
    }

    const skip = (page - 1) * limit;

    // 3️⃣ Build dynamic filter
    const whereFilter: any = {
      cafeId: Number(cafeId),
      is_active: true,
    };

    if (search) {
      whereFilter.name = { contains: search, mode: "insensitive" };
    }

    if (categoryId) {
      whereFilter.categoryId = categoryId;
    }

    // 4️⃣ Fetch filtered + paginated items
    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where: whereFilter,
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
      prisma.menuItem.count({ where: whereFilter }),
    ]);

    // 5️⃣ Send response
    return res.status(200).json({
      message: "✅ Menu items fetched successfully!",
      pageInfo: {
        currentPage: page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
      items,
    });
  } catch (err: any) {
    console.error("❌ Error in getMenuItemsByCafe:", err.message || err);
    return res.status(500).json({ message: "🚨 Server error fetching menu." });
  }
};

// 3.2) Create a new Menu Item (Corrected)
// 3.2) Create a new Menu Item (Final Corrected Version)
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const {
      cafeId,
      categoryId,
      name,
      price,
      description,
      food_image_url,
      isSpecial,
      dietary,
      tags, // This is now a single string like "Spicy" or undefined
    } = req.body;

    if (!cafeId || !categoryId || !name || !price) {
      return res.status(400).json({
        message: "🚫 Required: cafeId, categoryId, name, price.",
      });
    }

    // ❌ REMOVED: const singleTag = tags && tags.length > 0 ? tags[0] : undefined;

    const newItem = await prisma.menuItem.create({
      data: {
        cafeId: Number(cafeId),
        categoryId: Number(categoryId),
        name,
        price: Number(price),
        description,
        food_image_url,
        isSpecial: isSpecial || false,
        dietary, // Directly uses the 'dietary' value
        tags: tags, // ✅ FIX: Directly uses the 'tags' value, just like 'dietary'
        is_active: true,
        is_available: true,
      },
    });

    return res.status(201).json({
      message: "✅ Menu item created successfully!",
      item: newItem,
    });
  } catch (err: any) {
    console.error("❌ Error in createMenuItem:", err.message || err);
    return res.status(500).json({ message: "🚨 Failed to create menu item." });
  }
};

// 3.3) Update an existing Menu Item (Final Corrected Version)
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const {
      name,
      price,
      description,
      isSpecial,
      dietary,
      tags, // This is a single string, null, or undefined
      categoryId,
      is_available,
      food_image_url,
    } = req.body;

    const dataToUpdate: any = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (price !== undefined) dataToUpdate.price = Number(price);
    if (description !== undefined) dataToUpdate.description = description;
    if (isSpecial !== undefined) dataToUpdate.isSpecial = isSpecial;
    if (dietary !== undefined) dataToUpdate.dietary = dietary;
    if (categoryId !== undefined) dataToUpdate.categoryId = Number(categoryId);
    if (is_available !== undefined) dataToUpdate.is_available = is_available;
    if (food_image_url !== undefined)
      dataToUpdate.food_image_url = food_image_url;

    // ✅ FIX: Directly assign the tag if it exists. Prisma handles 'null' or 'undefined' correctly.
    if (tags !== undefined) {
      dataToUpdate.tags = tags;
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: Number(itemId) },
      data: dataToUpdate,
    });

    return res.status(200).json({
      message: "✏️ Menu item updated successfully!",
      item: updatedItem,
    });
  } catch (err: any) {
    console.error("❌ Error in updateMenuItem:", err.message || err);
    return res.status(500).json({ message: "🚨 Failed to update menu item." });
  }
};

// 3.4 Fetch all unavailable (is_active: false) items for a cafe
export const getUnavailableMenuItemsByCafe = async (
  req: Request,
  res: Response
) => {
  try {
    const { cafeId } = req.params;
    const items = await prisma.menuItem.findMany({
      where: {
        cafeId: Number(cafeId),
        is_active: false, // The key difference
      },
      include: {
        category: true, // Include category name
      },
      orderBy: {
        name: "asc",
      },
    });
    return res.status(200).json({ items });
  } catch (err: any) {
    console.error("Error fetching unavailable menu items:", err.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch unavailable menu items." });
  }
};

// 3.5 Reactivate a menu item (set is_active back to true)
export const reactivateMenuItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const updatedItem = await prisma.menuItem.update({
      where: { id: Number(itemId) },
      data: { is_active: true, is_available: true },
    });
    return res.status(200).json({
      message: "✅ Menu item reactivated successfully!",
      item: updatedItem,
    });
  } catch (err: any) {
    console.error("Error reactivating menu item:", err.message);
    return res
      .status(500)
      .json({ message: "🚨 Failed to reactivate menu item." });
  }
};

// 3.6  Delete a Menu Item (Soft Delete)
export const hardDeleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    await prisma.menuItem.delete({
      where: { id: Number(itemId) },
    });
    return res
      .status(200)
      .json({ message: "🗑️ Menu item permanently deleted." });
  } catch (err: any) {
    // Handle cases where the item might be part of an order
    if (err.code === "P2003") {
      return res.status(409).json({
        message: "🚨 Cannot delete item as it is part of existing orders.",
      });
    }
    console.error("Error permanently deleting menu item:", err.message);
    return res
      .status(500)
      .json({ message: "🚨 Failed to permanently delete menu item." });
  }
};

// 3.7) Permanently delete a menu item
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Extract itemId
    const { itemId } = req.params;

    // 2️⃣ Mark item as inactive (soft delete)
    await prisma.menuItem.update({
      where: { id: Number(itemId) },
      data: { is_active: false },
    });

    // 3️⃣ Send response
    return res.status(200).json({ message: "🗑️ Menu item deleted (soft)!" });
  } catch (err: any) {
    console.error("❌ Error in deleteMenuItem:", err.message || err);
    return res.status(500).json({ message: "🚨 Failed to delete menu item." });
  }
};

// 3.8) Toggle Menu Item Availability
export const toggleMenuItemAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    // 1️⃣ Extract menu item ID from URL
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({ message: "🚫 Item ID is required." });
    }

    // 2️⃣ Fetch existing item
    const item = await prisma.menuItem.findUnique({
      where: { id: Number(itemId) },
      select: { is_available: true },
    });

    if (!item) {
      return res.status(404).json({ message: "❌ Menu item not found." });
    }

    // 3️⃣ Toggle is_available
    const updatedItem = await prisma.menuItem.update({
      where: { id: Number(itemId) },
      data: {
        is_available: !item.is_available,
      },
    });

    // 4️⃣ Respond with success
    return res.status(200).json({
      message: `✅ Item is now ${
        updatedItem.is_available ? "available ✅" : "unavailable ⛔"
      }.`,
      item: updatedItem,
    });
  } catch (err: any) {
    console.error(
      "❌ Error in toggleMenuItemAvailability:",
      err.message || err
    );
    return res
      .status(500)
      .json({ message: "🚨 Server error toggling availability." });
  }
};
// 3.9) Get Menu Stats for a Cafe (Corrected)
export const getMenuStats = async (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;

    if (!cafeId) {
      return res.status(400).json({ message: "🚫 Cafe ID is required." });
    }

    const id = Number(cafeId);

    const [
      totalItems,
      availableItems,
      specialItems,
      unavailableItems,
      totalCategories,
      allItemsForTags,
    ] = await Promise.all([
      prisma.menuItem.count({ where: { cafeId: id, is_active: true } }),
      prisma.menuItem.count({
        where: { cafeId: id, is_active: true, is_available: true },
      }),
      prisma.menuItem.count({
        where: { cafeId: id, is_active: true, isSpecial: true },
      }),
      prisma.menuItem.count({ where: { cafeId: id, is_active: false } }),
      prisma.category.count({ where: { cafeId: id } }),
      // This query is now safe because the schema will be correct after reset
      prisma.menuItem.findMany({
        where: { cafeId: id, is_active: true },
        select: { tags: true },
      }),
    ]);

    // Calculate unique tags
    const allTags = allItemsForTags.flatMap((item) => item.tags);
    const uniqueTagsCount = new Set(allTags).size;

    return res.status(200).json({
      message: "✅ Menu stats fetched successfully!",
      stats: {
        totalItems,
        availableItems,
        specialItems,
        unavailableItems,
        totalCategories,
        totalTags: uniqueTagsCount,
      },
    });
  } catch (err: any) {
    console.error("❌ Error in getMenuStats:", err.message || err);
    return res
      .status(500)
      .json({ message: "🚨 Server error fetching menu stats." });
  }
};
