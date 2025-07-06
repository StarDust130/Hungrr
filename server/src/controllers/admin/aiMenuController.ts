// src/controllers/aiMenuController.ts

import { Request, Response } from "express";
import { Groq } from "groq-sdk";
import prisma from "../config/prisma";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_MENU, // Make sure this environment variable is correct
});

// A simpler, stricter prompt for the AI.
const generateMenuExtractionPrompt = (menuText: string): string => {
  return `
    From the menu text below, extract all food items and group them by category.

    Your entire response MUST be a single JSON object.
    The root of the object must be a key named "categories".
    The "categories" key must contain an array of objects.
    Each object in that array must have a "name" key (the category's name) and an "items" key (an array of the food items).
    Each food item must have a "name", "price" (as a number), "description" (a simple sentence), and "dietary" ("veg" or "non_veg").
    If you cannot find a price, make a reasonable guess; do not leave it blank or 0.
    if it is panner that means it is veg, if it is mention chicken, fish, egg, meat, beef, pork, mutton, lamb then it is non_veg.
    other wise it is veg. always make it veg if not sure.

    DO This to make input more better:
    Fix spelling mistakes, remove extra spaces, and ensure proper capitalization.
    make description good and simple english tell about this dish arount 80-100 text length.
    

    Example Format:
    {
      "categories": [
        {
          "name": "Category Name",
          "items": [
            {
              "name": "Item Name",
              "price": 120,
              "description": "A short, tasty description of the item.",
              "dietary": "veg"
            }
          ]
        }
      ]
    }

    Menu Text:
    ---
    ${menuText}
    ---
  `;
};

export const processMenuWithAI = async (req: Request, res: Response) => {
  try {
    const { menuText } = req.body;
    if (!menuText) {
      return res.status(400).json({ message: "Menu text is required." });
    }

    const prompt = generateMenuExtractionPrompt(menuText);

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
      temperature: 0.1,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("AI response was empty.");
    }

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain a valid JSON object.");
    }

    const parsedAIResponse = JSON.parse(jsonMatch[0]);

    // ✅ Strict validation: Reject bad data instead of trying to fix it.
    if (!parsedAIResponse || !Array.isArray(parsedAIResponse.categories)) {
      throw new Error(
        "AI response is missing the required 'categories' array."
      );
    }

    for (const category of parsedAIResponse.categories) {
      if (typeof category.name !== "string" || !Array.isArray(category.items)) {
        throw new Error("AI response contains an invalid category object.");
      }
    }

    // If validation passes, the data is good.
    return res.status(200).json(parsedAIResponse);
  } catch (error: any) {
    console.error("AI MENU PROCESSING ERROR:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const bulkSaveAIMenu = async (req: Request, res: Response) => {
  // This function is already robust and works as intended. No changes needed.
  // It correctly uses `upsert` to find existing categories or create new ones.
  try {
    const { categories, cafeId } = req.body;

    if (!Array.isArray(categories) || !cafeId) {
      return res
        .status(400)
        .json({
          message:
            "Invalid data format. 'categories' array and 'cafeId' are required.",
        });
    }

    await prisma.$transaction(async (tx) => {
      for (const categoryData of categories) {
        if (!categoryData.name || !Array.isArray(categoryData.items)) continue;

        const categoryName = categoryData.name
          .trim()
          .toLowerCase()
          .replace(/\b\w/g, (char: string) => char.toUpperCase());

        const category = await tx.category.upsert({
          where: { cafeId_name: { cafeId, name: categoryName } },
          update: {},
          create: { name: categoryName, cafeId },
        });

        const itemsToCreate = categoryData.items
          .map((item: any) => {
            const price = parseFloat(item.price);
            if (!item.name || isNaN(price) || price <= 0) return null;

            return {
              name: item.name.trim(),
              description:
                item.description?.trim() || "A delicious choice from our menu.",
              price,
              dietary: item.dietary === "non_veg" ? "non_veg" : "veg",
              cafeId,
              categoryId: category.id,
            };
          })
          .filter(Boolean);

        if (itemsToCreate.length > 0) {
          await tx.menuItem.createMany({
            data: itemsToCreate as any[],
            skipDuplicates: true,
          });
        }
      }
    });

    return res
      .status(201)
      .json({ message: "Menu has been successfully saved!" });
  } catch (error: any) {
    console.error("BULK SAVE ERROR:", error);
    return res
      .status(500)
      .json({
        message: "An error occurred while saving the menu to the database.",
      });
  }
};
