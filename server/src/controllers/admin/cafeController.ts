import { Request, Response } from "express";
import prisma from "../../config/prisma";

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
    console.error("💥 Error to Get Cafe Name ");
    return res.status(500).json({
      message: "😿 Server error while fetching cafe.",
    });
  }
};

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
        message:
          "🚫 Required fields: Cafe name, owner_id, address, phone , email and payment URL.",
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
export const updateCafe = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Extract owner_id from route parameters
    // The key here ('ownerId') MUST match your route definition (e.g., router.patch('/cafe/:ownerId', updateCafe))
    const { ownerId } = req.params;

    // 2️⃣ Validate that ownerId was actually captured
    if (!ownerId) {
      return res
        .status(400)
        .json({ message: "❌ Owner ID is missing from the URL." });
    }

    // 3️⃣ Use the correct variable to find the cafe.
    // Use findFirst or findUnique depending on whether owner_id is a unique field.
    // If owner_id is unique, this is fine.
    const existingCafe = await prisma.cafe.findUnique({
      where: { owner_id: ownerId }, // Correctly pass the captured 'ownerId'
    });

    if (!existingCafe) {
      return res
        .status(404)
        .json({ message: "❌ Cafe not found for this owner." });
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
    return res
      .status(500)
      .json({ message: "🚨 Server error while updating cafe." });
  }
};
