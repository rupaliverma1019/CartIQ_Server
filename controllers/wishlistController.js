const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { askGemini } = require("../services/geminiService");

// =====================================================
// ADD PRODUCT TO WISHLIST
// =====================================================
const addToWishList = async (req, res) => {
  try {
    const { productID } = req.body;

    if (!productID) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await product.findById(productID);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const exist = await Wishlist.findOne({
      user: req.user._id,
      product: productID,
    });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Product already available in wishlist",
      });
    }

    await Wishlist.create({
      user: req.user._id,
      product: productID,
    });

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET USER WISHLIST
// =====================================================
const getWishList = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user._id,
    }).populate("product");

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// REMOVE PRODUCT FROM WISHLIST
// =====================================================
const removeWishList = async (req, res) => {
  try {
    const { productID } = req.params;

    const deleted = await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: productID,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// CHECK PRODUCT IN WISHLIST
// =====================================================
const checkWishlist = async (req, res) => {
  try {
    const { productID } = req.params;

    const exists = await Wishlist.findOne({
      user: req.user._id,
      product: productID,
    });

    res.status(200).json({
      success: true,
      isWishlisted: !!exists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// AI SMART WISHLIST
// =====================================================
const smartWishlist = async (req, res) => {
  try {
    // 1. Get user's wishlist
    const wishlist = await Wishlist.find({
      user: req.user._id,
    }).populate("product");

    if (!wishlist.length) {
      return res.status(200).json({
        success: true,
        message: "Your wishlist is empty",
        analysis: null,
        recommendations: [],
      });
    }

    // 2. Remove invalid/deleted products
    const products = wishlist
      .filter((item) => item.product)
      .map((item) => ({
        id: item.product._id,
        title: item.product.title,
        category: item.product.category,
        price: item.product.price,
        description: item.product.description,
        stock: item.product.stock,
      }));

    if (!products.length) {
      return res.status(200).json({
        success: true,
        message: "No valid products found in wishlist",
        analysis: null,
        recommendations: [],
      });
    }

    // 3. Create AI prompt
    const aiPrompt = `
You are an AI shopping assistant for an ecommerce application.

Analyze the user's wishlist.

Wishlist Products:
${JSON.stringify(products, null, 2)}

Give useful shopping advice.

Return ONLY valid JSON in this exact format:

{
  "summary": "Short summary of the user's wishlist",
  "shoppingStyle": "Describe the user's shopping preference",
  "topPick": {
    "productId": "product id",
    "reason": "Why this product is a good choice"
  },
  "priceInsights": "Give useful price-related advice",
  "stockAlerts": [
    {
      "productId": "product id",
      "message": "Stock-related message"
    }
  ],
  "recommendations": [
    {
      "productId": "product id",
      "reason": "Why the user should consider this product"
    }
  ]
}

Rules:
- Only use products from the wishlist.
- Do not invent product IDs.
- Keep the response concise.
- Return valid JSON only.
`;

    // 4. Ask Gemini
    const aiResponse = await askGemini(aiPrompt);

    // 5. Clean Gemini response
    let cleanedResponse = aiResponse.trim();

    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();
    }

    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();
    }

    // 6. Convert AI response into JSON
    let analysis;

    try {
      analysis = JSON.parse(cleanedResponse);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "AI returned an invalid response",
        rawResponse: aiResponse,
      });
    }

    // 7. Send response
    res.status(200).json({
      success: true,
      wishlistCount: products.length,
      analysis,
    });
  } catch (error) {
    console.error("Smart Wishlist Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addToWishList,
  getWishList,
  removeWishList,
  checkWishlist,
  smartWishlist,
};