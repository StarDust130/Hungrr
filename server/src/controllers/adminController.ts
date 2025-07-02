// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import {  OrderStatus } from "../utils/types";
import slugify from "slugify";
import { startOfDay, startOfWeek, format } from "date-fns";
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
export const updateCafe = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Extract owner_id from route or auth context
    const { owner_id } = req.params;

    // 2️⃣ Check if cafe exists
    const existingCafe = await prisma.cafe.findUnique({
      where: { owner_id },
    });

    if (!existingCafe) {
      return res.status(404).json({
        message: "❌ Cafe not found for this owner.",
      });
    }

    // 3️⃣ Destructure updatable fields from body
    const {
      name,
      address,
      phone,
      email,
      openingTime,
      tagline,
      logoUrl,
      bannerUrl,
      payment_url,
      rating,
      reviews,
      gstPercentage,
      gstNo,
    } = req.body;

    // 4️⃣ Optionally regenerate slug if name is updated
    let slug = existingCafe.slug;
    if (name && name !== existingCafe.name) {
      let baseSlug = slugify(name, { lower: true, strict: true });
      slug = baseSlug;
      let count = 1;

      while (
        await prisma.cafe.findUnique({
          where: { slug },
        })
      ) {
        count++;
        slug = `${baseSlug}-${count}`;
      }
    }

    // 5️⃣ Update cafe
    const updatedCafe = await prisma.cafe.update({
      where: { owner_id },
      data: {
        name,
        address,
        phone,
        email,
        openingTime,
        tagline,
        logoUrl,
        bannerUrl,
        payment_url,
        slug,
        rating,
        reviews,
        gstPercentage,
        gstNo,
      },
    });

    // 6️⃣ Respond success
    return res.status(200).json({
      message: "✅ Cafe updated successfully!",
      cafe: updatedCafe,
    });
  } catch (err: any) {
    console.error("❌ Error in updateCafe:", err.message || err);
    return res.status(500).json({
      message: "🚨 Server error while updating cafe.",
    });
  }
};



//! 2) Order Management (Get all orders , updateOrderStatus) 🥘

// 2.1️ Get All Orders for Admin Dashboard or Order Page
export const getOrdersByCafe = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Extract cafeId and query params
    const { cafeId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const filter = req.query.filter as string; // 'today', 'week', 'month'

    // 2️⃣ Validate cafeId
    if (!cafeId) {
      return res.status(400).json({
        message: "🚫 Cafe ID is required in the URL.",
      });
    }

    const skip = (page - 1) * limit;

    // 3️⃣ Build date filter if applicable
    let dateFilter = {};
    const now = new Date();

    if (filter === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      const end = new Date(now);
      end.setHours(23, 59, 59, 999);

      dateFilter = {
        created_at: {
          gte: start,
          lte: end,
        },
      };
    }

    if (filter === "week") {
      const start = new Date(now);
      start.setDate(start.getDate() - 6); // includes today
      start.setHours(0, 0, 0, 0);

      dateFilter = {
        created_at: {
          gte: start,
          lte: now,
        },
      };
    }

    if (filter === "month") {
      const start = new Date(now);
      start.setDate(1); // first day of month
      start.setHours(0, 0, 0, 0);

      dateFilter = {
        created_at: {
          gte: start,
          lte: now,
        },
      };
    }

    // 4️⃣ Fetch orders with filter + pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: {
          cafeId: Number(cafeId),
          ...dateFilter,
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          publicId: true,
          tableNo: true,
          payment_method: true,
          orderType: true,
          total_price: true,
          paid: true,
          created_at: true,
          status: true,
        },
      }),
      prisma.order.count({
        where: {
          cafeId: Number(cafeId),
          ...dateFilter,
        },
      }),
    ]);

    // 5️⃣ Respond with pagination and data
    return res.status(200).json({
      message: "✅ Orders fetched successfully!",
      filter: filter || "all",
      pageInfo: {
        currentPage: page,
        limit,
        totalOrders: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      orders,
    });
  } catch (err: any) {
    console.error("❌ Error in getOrdersByCafe:", err.message || err);
    return res.status(500).json({
      message: "🚨 Server error while fetching orders.",
    });
  }
};


// 2.2 Update Order Status (Socket io Live Status Show) 📦
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, paid } = req.body;

    // --- Input Validation (Your code here is already perfect) ---
    if (status === undefined && paid === undefined) {
      return res
        .status(400)
        .json({ message: "Request must contain 'status' or 'paid'" });
    }
    const numericOrderId = Number(orderId);
    if (isNaN(numericOrderId)) {
      return res.status(400).json({ message: "Invalid orderId" });
    }
    const dataToUpdate: { status?: OrderStatus; paid?: boolean } = {};
    if (status) {
      // Your status validation is correct
      dataToUpdate.status = status;
    }
    if (paid !== undefined) {
      // Your 'paid' validation is correct
      dataToUpdate.paid = paid;
    }
    // --- End Validation ---

    // ✅ FIX: Get the results by destructuring the returned value from the transaction
    const { finalOrder, finalBill } = await prisma.$transaction(async (tx) => {
      // Step 1: Update the order
      const updatedOrder = await tx.order.update({
        where: { id: numericOrderId },
        data: dataToUpdate,
        select: {
          id: true,
          status: true,
          paid: true,
          total_price: true,
        },
      });

      let newBill = null;
      // Step 2: If paid and completed, create a bill if one doesn't exist
      if (updatedOrder.paid && updatedOrder.status === "completed") {
        const existingBill = await tx.bill.findFirst({
          where: { orderId: numericOrderId },
        });

        if (!existingBill) {
          newBill = await tx.bill.create({
            data: {
              orderId: numericOrderId,
              amount: updatedOrder.total_price,
              paid_at: new Date(),
            },
          });
        }
      }

      // ✅ FIX: Return the results from the transaction block
      return { finalOrder: updatedOrder, finalBill: newBill };
    });

    // Now 'finalOrder' and 'finalBill' have the correct values here.

    // Emit update via Socket.io
    const io = req.app.get("io");
    const roomName = `order_${numericOrderId}`;
    const payload = {
      status: finalOrder.status,
      paid: finalOrder.paid,
    };

    io.to(roomName).emit("order_updated", payload);

    return res.status(200).json({
      message: "Order updated successfully.",
      order: finalOrder,
      bill: finalBill, // Will be null if no bill was created
    });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Order not found." });
    }
    console.error("❌ Error in updateOrderStatus:", err.message || err);
    return res.status(500).json({ message: "Server error" });
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

    // 1️⃣ Validate cafe ID
    if (!cafeId) {
      return res.status(400).json({ message: "🚫 Cafe ID is required." });
    }

    // 2️⃣ Fetch categories
    const categories = await prisma.category.findMany({
      where: { cafeId: Number(cafeId) },
      orderBy: { id: "asc" },
    });

    // 3️⃣ Respond
    return res.status(200).json({
      message: "📦 Categories fetched successfully!",
      categories,
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

    // 2️⃣ Prevent duplicate name in same cafe
    const existing = await prisma.category.findFirst({
      where: {
        name,
        cafeId: Number(cafeId),
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "⚠️ Category name already exists for this cafe." });
    }

    // 3️⃣ Create category
    const newCategory = await prisma.category.create({
      data: {
        name,
        cafeId: Number(cafeId),
      },
    });

    // 4️⃣ Respond
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