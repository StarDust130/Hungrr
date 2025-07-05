// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import {  OrderStatus } from "../utils/types";
import slugify from "slugify";
import { startOfDay, startOfWeek, format, endOfDay, subDays } from "date-fns";
import {  generateTodayAISummaryPrompt } from "../utils/dashboardSummaryPrompt";
import { groq } from "../utils/groqClient";


//! 1) CAFE  (Create , Read , Update) by Admin 🧁

// 1.1) Get Cafe Details by ownerID
export const getCafeByOwnerId = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Extract owner ID from request params
    const { ownerId } = req.params;

    // 2️⃣ Validate input
    if (!ownerId) {
      return res.status(400).json({
        message: "🚫 Owner ID is required in the URL.",
      });
    }

    // 3️⃣ Fetch cafe using owner_id
    const cafe = await prisma.cafe.findFirst({
      where: { owner_id: ownerId },
    });

    // 4️⃣ Handle not found
    if (!cafe) {
      return res.status(404).json({
        message: "❌ No cafe found for this owner.",
      });
    }

    // 5️⃣ Success
    return res.status(200).json({
      message: "✅ Cafe fetched successfully!",
      cafe,
    });
  } catch (err: any) {
    console.error("💥 Error in getCafeByOwnerId:", err.message || err);
    return res.status(500).json({
      message: "🚨 Server error while fetching cafe.",
    });
  }
};

// 1.2 Get Cafe name and logo URl
export const getCafeNameandLogoURL = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Extract owner ID from request params
    const { ownerId } = req.params;

    // 2️⃣ Validate input
    if (!ownerId) {
      return res.status(400).json({
        message: "🚫 Owner ID is required in the URL.",
      });
    } 

    const cafe = await prisma.cafe.findFirst({
      where: { owner_id: ownerId },
      select: {
        name: true,
        logoUrl: true,
        id: true, // Include ID for potential future use
      },
    });

    // 4️⃣ Handle not found
    if (!cafe) {
      return res.status(404).json({
        message: "❌ No cafe found for this owner.",
      });
    }

    // 5️⃣ Success
    return res.status(200).json({
      message: "✅ Cafe fetched successfully!",
      cafe,
    });
  } catch (error) {
    console.error("💥 Error to Get Cafe Name ")
    return res.status(500).json({
      message: "😿 Server error while fetching cafe.",
    });

    
  }
  
}


// 1.3) Create a new Café (Admin Onboarding Panel)
export const createCafe = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Destructure request body
    const {
      name,
      owner_id,
      address,
      openingTime,
      email,
      phone,
      tagline,
      logoUrl,
      bannerUrl,
      payment_url,
      rating,
      reviews,
      gstPercentage,
      gstNo,
      isPureVeg,
      instaID,
    } = req.body;

    // 2️⃣ Validate required fields
    if (!name || !owner_id || !address || !phone || !email || !payment_url) {
      return res.status(400).json({
        message: "🚫 Required fields: Cafe name, owner_id, address, phone , email and payment URL.",
      });
    }

    // 3️⃣ Prevent duplicate café for the same owner
    const existingCafe = await prisma.cafe.findUnique({
      where: { owner_id },
    });

    if (existingCafe) {
      return res.status(409).json({
        message: "⚠️ Cafe already exists for this owner.",
        cafe: existingCafe,
      });
    }

    // 5️⃣ Generate a unique slug from the name
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    while (
      await prisma.cafe.findUnique({
        where: { slug },
      })
    ) {
      count++;
      slug = `${baseSlug}-${count}`;
    }

    // 6️⃣ Create new café
    const newCafe = await prisma.cafe.create({
      data: {
        name,
        owner_id,
        address,
        phone,
        openingTime,
        tagline,
        email,
        logoUrl,
        bannerUrl,
        payment_url,
        slug,
        rating: rating || 4.7, // fallback default
        reviews: reviews || 969,
        gstPercentage: gstPercentage || 5,
        gstNo,
        isPureVeg,
        instaID,
        isOnboarded: true, // mark onboarding as complete
      },
    });

    // 7️⃣ Respond success
    return res.status(201).json({
      message: "✅ Cafe created successfully!",
      cafe: newCafe,
    });
  } catch (err: any) {
    console.error("❌ Error in createCafe:", err.message || err);
    return res.status(500).json({
      message: "🚨 Server error while creating cafe.",
    });
  }
};

// 1.4) Update an existing Café (Admin Panel)
// In your server's adminController.ts

export const updateCafe = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Extract owner_id from route parameters
    // The key here ('ownerId') MUST match your route definition (e.g., router.patch('/cafe/:ownerId', updateCafe))
    const { ownerId } = req.params;

    // 2️⃣ Validate that ownerId was actually captured
    if (!ownerId) {
      return res.status(400).json({ message: "❌ Owner ID is missing from the URL." });
    }

    // 3️⃣ Use the correct variable to find the cafe.
    // Use findFirst or findUnique depending on whether owner_id is a unique field.
    // If owner_id is unique, this is fine.
    const existingCafe = await prisma.cafe.findUnique({
      where: { owner_id: ownerId }, // Correctly pass the captured 'ownerId'
    });

    if (!existingCafe) {
      return res.status(404).json({ message: "❌ Cafe not found for this owner." });
    }

    // ... The rest of your update logic ...
    
    // 4️⃣ Update the cafe
    const updatedCafe = await prisma.cafe.update({
        where: { owner_id: ownerId }, // Use the same identifier here
        data: req.body, // Pass the entire body of changed data
    });

    // 5️⃣ Respond with success
    return res.status(200).json({
      message: "✅ Cafe updated successfully!",
      cafe: updatedCafe,
    });
  } catch (err: any) {
    console.error("❌ Error in updateCafe:", err.message || err);
    return res.status(500).json({ message: "🚨 Server error while updating cafe." });
  }
};



//! 2) Order Management (Get all orders , updateOrderStatus) 🥘
// Utility to build the date filtering clause for Prisma
const getDateWhereClause = (range?: string, date?: string) => {
  if (date) {
    const startDate = startOfDay(new Date(date));
    const endDate = endOfDay(new Date(date));
    return { gte: startDate, lte: endDate };
  }

  const now = new Date();
  let gte;
  if (range === "today") {
    gte = startOfDay(now);
  } else if (range === "week") {
    gte = startOfDay(subDays(now, 6)); // Correctly includes today
  } else if (range === "month") {
    gte = startOfDay(subDays(now, 29)); // Correctly includes today
  }

  return gte ? { gte } : undefined;
};

/**
 * @description Get Paginated and Filtered Orders for a Cafe
 * @route GET /api/orders/cafe/:cafeId
 */
/**
 * @description Get Paginated and Filtered Orders for a Cafe
 * @route GET /api/orders/cafe/:cafeId
 */
export const getOrdersByCafe = async (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;
    
    // ✅ FIXED: Now correctly reading 'range' and 'date' from the query
    const {
      limit = "10",
      page = "1",
      search,
      status,
      range, // <-- Added
      date,   // <-- Added
    } = req.query as { [key: string]: string };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // --- Build the dynamic WHERE clause ---
    const whereClause: any = { cafeId: Number(cafeId) };

    // Text search filter
    if (search) {
      whereClause.publicId = { contains: search, mode: "insensitive" };
    }
    
    // Status filter
    if (status && status !== "all") {
      whereClause.status = { equals: status };
    }

    // ✅ FIXED: Added the date filtering logic
    if (range) {
        const now = new Date();
        let gte; // "greater than or equal to" date
        if (range === "today") {
            gte = startOfDay(now);
        } else if (range === "week") {
            gte = startOfDay(subDays(now, 6)); // Includes today + last 6 days
        } else if (range === "month") {
            gte = startOfDay(subDays(now, 29)); // Includes today + last 29 days
        }
        if (gte) {
            whereClause.created_at = { gte };
        }
    } else if (date) {
        // If a specific date is chosen, filter for that day only
        const startDate = startOfDay(new Date(date));
        const endDate = endOfDay(new Date(date));
        whereClause.created_at = { gte: startDate, lte: endDate };
    }

    // --- Fetch data from the database ---
    const [orders, totalCount] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause, // The whereClause now includes date filters
        orderBy: { created_at: "desc" },
        skip,
        take: limitNum,
        select: {
          id: true,
          publicId: true,
          tableNo: true,
          total_price: true,
          created_at: true,
          status: true,
        },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    res.status(200).json({
      message: "✅ Orders fetched successfully with filters!",
      pageInfo: {
        currentPage: pageNum,
        limit: limitNum,
        totalOrders: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      orders,
    });
  } catch (err) {
    console.error("❌ Error in getOrdersByCafe:", err);
    res.status(500).json({ message: "🚨 Server error." });
  }
};


/**
 * @description Get Full Details for a Single Order
 * @route GET /api/order/:orderId/details
 */
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        order_items: {
          select: {
            quantity: true,
            item: {
              select: { name: true, price: true },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "🚫 Order not found." });
    }

    res.status(200).json({ message: "✅ Order details fetched.", order });
  } catch (err) {
    console.error("❌ Error in getOrderDetails:", err);
    res.status(500).json({ message: "🚨 Server error." });
  }
};

/**
 * @description Get Dashboard Statistics for a Cafe
 * @route GET /api/stats/cafe/:cafeId
 */
export const getCafeStats = async (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;
    const { range = "today", date } = req.query as { [key: string]: string };

    const whereClause: any = { cafeId: Number(cafeId) };
    const dateFilter = getDateWhereClause(range, date);
    if (dateFilter) {
      whereClause.created_at = dateFilter;
    }

    const [stats, statusCounts] = await prisma.$transaction([
      prisma.order.aggregate({
        _sum: { total_price: true },
        _count: { id: true },
        where: whereClause,
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: whereClause,
        _count: { status: true },
        orderBy: undefined
      }),
    ]);

    const totalRevenue = stats._sum.total_price?.toNumber() || 0;
    const totalOrders = stats._count.id || 0;

    const countsByStatus = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count?.status ?? 0;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      message: "✅ Stats fetched successfully!",
      stats: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        pending: countsByStatus.pending || 0,
      },
    });
  } catch (err) {
    console.error("❌ Error in getCafeStats:", err);
    res.status(500).json({ message: "🚨 Server error while fetching stats." });
  }
};


// ... (keep your existing getOrdersByCafe, getOrderDetails, getCafeStats functions here) ...

/**
 * @description Update the status of a specific order
 * @route PATCH /api/order/:orderId/status
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate the incoming status
    const validStatuses = [
      "pending",
      "accepted",
      "preparing",
      "ready",
      "completed",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "🚫 Invalid status provided." });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status },
    });
    
    // In a real-time app, you would emit a socket.io event here
    // const io = req.app.get("io");
    // io.to(`cafe_${updatedOrder.cafeId}`).emit('order_status_updated', updatedOrder);

    res.status(200).json({
      message: "✅ Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (err: any) {
    // Prisma's error code for a record not found
    if (err.code === "P2025") {
      return res.status(404).json({ message: "🚫 Order not found." });
    }
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ message: "🚨 Server error." });
  }
};

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
  
}

// Fetch all unavailable (is_active: false) items for a cafe
export const getUnavailableMenuItemsByCafe = async (req: Request, res: Response) => {
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
        name: 'asc',
      },
    });
    return res.status(200).json({ items });
  } catch (err: any) {
    console.error("Error fetching unavailable menu items:", err.message);
    return res.status(500).json({ message: "Failed to fetch unavailable menu items." });
  }
};

// Reactivate a menu item (set is_active back to true)
export const reactivateMenuItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const updatedItem = await prisma.menuItem.update({
            where: { id: Number(itemId) },
            data: { is_active: true, is_available: true },
        });
        return res.status(200).json({ message: "✅ Menu item reactivated successfully!", item: updatedItem });
    } catch (err: any) {
        console.error("Error reactivating menu item:", err.message);
        return res.status(500).json({ message: "🚨 Failed to reactivate menu item." });
    }
};


// Permanently delete a menu item
export const hardDeleteMenuItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        await prisma.menuItem.delete({
            where: { id: Number(itemId) },
        });
        return res.status(200).json({ message: "🗑️ Menu item permanently deleted." });
    } catch (err: any) {
        // Handle cases where the item might be part of an order
        if (err.code === 'P2003') {
             return res.status(409).json({ message: "🚨 Cannot delete item as it is part of existing orders." });
        }
        console.error("Error permanently deleting menu item:", err.message);
        return res.status(500).json({ message: "🚨 Failed to permanently delete menu item." });
    }
};



// 3.4) Delete a Menu Item (Soft Delete)
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

// 3.5) Toggle Menu Item Availability
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
// 3.6) Get Menu Stats for a Cafe (Corrected)
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


//! 4) 🧾 Category Controllers (CRUD)

// 4.1)Get All Categories for a Cafe
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
// 4.2) Create a new Category
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

    const newOrder = lastCategory ? ((lastCategory.order ?? -1) + 1) : 0;

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

// 4.3) Update an existing Category
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

// 4.4) Delete a Category (Soft Delete)
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

// ✨ 4.4) Update the order of all Categories for a Cafe
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


//! 5) Dashboard Stats  📊

// 5.1) Get Dashboard Summary for a Cafe
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Get inputs
    const { cafeId } = req.params;
    const range = (req.query.range as "today" | "week") || "today";

    if (!cafeId) {
      return res.status(400).json({ message: "🚫 Cafe ID is required." });
    }

    const dateFilter =
      range === "week"
        ? { gte: startOfWeek(new Date()) }
        : { gte: startOfDay(new Date()) };

    // 2️⃣ Collect stats
    const [totalOrders, totalRevenue, popularItem, orderStats] =
      await Promise.all([
        prisma.order.count({
          where: { cafeId: Number(cafeId), created_at: dateFilter },
        }),
        prisma.order.aggregate({
          where: { cafeId: Number(cafeId), created_at: dateFilter, paid: true },
          _sum: { total_price: true },
        }),
        prisma.orderItem.groupBy({
          by: ["itemId"],
          where: {
            order: {
              cafeId: Number(cafeId),
              created_at: dateFilter,
            },
          },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 1,
        }),
        prisma.order.groupBy({
          by: ["status"],
          where: {
            cafeId: Number(cafeId),
            created_at: dateFilter,
          },
          _count: true,
        }),
      ]);

    let popularItemName = "N/A";
    if (popularItem.length > 0) {
      const item = await prisma.menuItem.findUnique({
        where: { id: popularItem[0].itemId },
        select: { name: true },
      });
      popularItemName = item?.name || "N/A";
    }

    const stats = {
      totalOrders,
      totalRevenue: totalRevenue._sum.total_price?.toFixed(2) || "0.00",
      popularItem: popularItemName,
      orderStatusCounts: orderStats.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>),
    };

    // 3️⃣ Send response
    return res.status(200).json({
      message: "✅ Dashboard summary ready!",
      stats,
    });
  } catch (err: any) {
    console.error("❌ Error in getDashboardSummary:", err.message || err);
    return res.status(500).json({
      message: "🚨 Failed to generate summary.",
    });
  }
};

// 5.2) Generate AI Insights for Dashboard
export const getTodayAISummary = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Get cafe ID
    const { cafeId } = req.params;
    if (!cafeId) {
      return res.status(400).json({ message: "🚫 Cafe ID is required." });
    }

    const now = new Date();
    const todayFilter = { gte: startOfDay(now) };

    // 2️⃣ Fetch cafe info
    const cafe = await prisma.cafe.findUnique({
      where: { id: Number(cafeId) },
      select: {
        name: true,
        tagline: true,
        openingTime: true,
      },
    });

    if (!cafe) {
      return res.status(404).json({ message: "❌ Cafe not found." });
    }

    // 3️⃣ Get today's order data
    const [orderCount, revenue, topItemData] = await Promise.all([
      prisma.order.count({
        where: { cafeId: Number(cafeId), created_at: todayFilter },
      }),
      prisma.order.aggregate({
        where: {
          cafeId: Number(cafeId),
          created_at: todayFilter,
          paid: true,
        },
        _sum: { total_price: true },
      }),
      prisma.orderItem.groupBy({
        by: ["itemId"],
        where: {
          order: {
            cafeId: Number(cafeId),
            created_at: todayFilter,
          },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 1,
      }),
    ]);

    let topItemName = "N/A";
    if (topItemData.length > 0) {
      const item = await prisma.menuItem.findUnique({
        where: { id: topItemData[0].itemId },
        select: { name: true },
      });
      topItemName = item?.name || "N/A";
    }

    const currentTime = format(now, "hh:mm a");
    const totalRevenue = revenue._sum.total_price?.toFixed(2) || "0.00";

    // 4️⃣ Build AI prompt with cafe context
    const prompt = generateTodayAISummaryPrompt({
      orderCount,
      totalRevenue,
      topItem: topItemName,
      currentTime,
      cafeName: cafe.name,
      cafeTagline: cafe.tagline || "",
      openingTime: cafe.openingTime || "09:00 AM",
    });

    // 5️⃣ Get AI response
    const chat = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
      temperature: 0.9,
      max_tokens: 300,
      stream: false,
    });

    const aiInsight =
      chat.choices[0]?.message?.content?.trim() || "No AI insight.";

    // 6️⃣ Respond to frontend
    return res.status(200).json({
      aiInsight,
    });
  } catch (err: any) {
    console.error("❌ AI Summary Error:", err.message || err);
    return res
      .status(500)
      .json({ message: "🚨 Failed to generate AI insight." });
  }
};