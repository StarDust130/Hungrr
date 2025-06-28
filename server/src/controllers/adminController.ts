// src/controllers/cafeController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import {  OrderStatus } from "../utils/types";
import slugify from "slugify";




  

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


// 1.2) Create a new Café (Admin Onboarding Panel)
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

// 1.3) Update an existing Café (Admin Panel)
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


//! 2) DASHBOARD (Admin Panel) 📊


//! 3) Order Management (Get all orders , updateOrderStatus) 🥘

// 3.1️ Get All Orders for Admin Dashboard or Order Page
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


// 3.2 Update Order Status (Socket io Live Status Show) 📦
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

//! 4) Menu Management (Get ,Add, Update, Delete) 🍽️

// 4.1) Get Menu Items by Cafe ID
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


// 4.2) Create a new Menu Item
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Destructure request body
    const {
      cafeId,
      categoryId,
      name,
      price,
      description,
      food_image_url,
      isSpecial,
      dietary,
      tags,
    } = req.body;

    // 2️⃣ Validate required fields
    if (!cafeId || !categoryId || !name || !price) {
      return res.status(400).json({
        message: "🚫 Required: cafeId, categoryId, name, price.",
      });
    }

    // 3️⃣ Create item
    const newItem = await prisma.menuItem.create({
      data: {
        cafeId,
        categoryId,
        name,
        price,
        description,
        food_image_url,
        isSpecial: isSpecial || false,
        dietary,
        tags: tags || [],
        is_active: true,
        is_available: true,
      },
    });

    // 4️⃣ Send response
    return res.status(201).json({
      message: "✅ Menu item created successfully!",
      item: newItem,
    });
  } catch (err: any) {
    console.error("❌ Error in createMenuItem:", err.message || err);
    return res.status(500).json({ message: "🚨 Failed to create menu item." });
  }
};

// 4.3) Update an existing Menu Item
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Extract itemId
    const { itemId } = req.params;

    // 2️⃣ Update item with provided fields
    const updated = await prisma.menuItem.update({
      where: { id: Number(itemId) },
      data: req.body, // client must send only allowed fields
    });

    // 3️⃣ Send response
    return res.status(200).json({
      message: "✏️ Menu item updated successfully!",
      item: updated,
    });
  } catch (err: any) {
    console.error("❌ Error in updateMenuItem:", err.message || err);
    return res.status(500).json({ message: "🚨 Failed to update menu item." });
  }
};

// 4.4) Delete a Menu Item (Soft Delete)
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

// 4.5) Toggle Menu Item Availability
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


//! 5) 🧾 Category Controllers (CRUD)

// 5.1)Get All Categories for a Cafe
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

// 5.2) Create a new Category
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

// 5.3) Update an existing Category
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

// 5.4) Delete a Category (Soft Delete)
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

