const Product = require("../models/Product");
const { GoogleGenAI } = require("@google/genai");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

const { askGemini } = require("../services/geminiService");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("🔥 getPersonalizedRecommendations CALLED");
  console.log("User:", req.user?._id);
    // -----------------------------------------
    // 1. Get user's wishlist
    // -----------------------------------------

    const wishlist = await Wishlist.findOne({
      user: userId,
    }).populate("product");

    // -----------------------------------------
    // 2. Get user's cart
    // -----------------------------------------

    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.product");

    // -----------------------------------------
    // 3. Get user's previous orders
    // -----------------------------------------

    const orders = await Order.find({
      user: userId,
    }).populate("items.product");

    // -----------------------------------------
    // 4. Prepare user interests
    // -----------------------------------------

    const wishlistProducts =
      wishlist?.products || [];

    const cartProducts =
      cart?.items?.map(
        (item) => item.product
      ) || [];

    const orderedProducts =
      orders.flatMap(
        (order) =>
          order.items.map(
            (item) => item.product
          )
      );

    // -----------------------------------------
    // 5. Create weighted product data
    // -----------------------------------------

    const userInterests = {

      wishlist: wishlistProducts.map(
        (product) => ({
          id: product?._id?.toString(),
          title: product?.title,
          category: product?.category,
          brand: product?.brand,
        })
      ),

      cart: cartProducts.map(
        (product) => ({
          id: product?._id?.toString(),
          title: product?.title,
          category: product?.category,
          brand: product?.brand,
        })
      ),

      orders: orderedProducts.map(
        (product) => ({
          id: product?._id?.toString(),
          title: product?.title,
          category: product?.category,
          brand: product?.brand,
        })
      ),
    };

    console.log(
      "User Interests:",
      userInterests
    );

    // -----------------------------------------
    // 6. Get available products from MongoDB
    // -----------------------------------------

    const availableProducts =
      await Product.find({});

    const productCatalog =
      availableProducts.map(
        (product) => ({
          id: product._id.toString(),
          title: product.title,
          category: product.category,
          brand: product.brand,
          price: product.price,
          description: product.description,
        })
      );

    // -----------------------------------------
    // 7. Send data to Gemini
    // -----------------------------------------

  const prompt = `
You are an AI recommendation engine for an e-commerce website.

Your job is to recommend products based on the user's actual shopping behavior.

========================
USER SHOPPING BEHAVIOR
========================

Wishlist Weight = 2
Cart Weight = 3
Orders/Purchases Weight = 4

User data:

${JSON.stringify(userInterests, null, 2)}

========================
AVAILABLE PRODUCTS
========================

${JSON.stringify(productCatalog, null, 2)}

========================
RECOMMENDATION RULES
========================

1. Purchased products have the highest importance (weight 4).

2. Cart products have medium-high importance (weight 3).

3. Wishlist products have lower importance (weight 2).

4. Identify the user's preferred:
   - category
   - brand
   - product type
   - product characteristics

5. If the user has purchased products from a specific category,
   strongly prioritize other products from the same category.

6. If the user has purchased products from a specific brand,
   prioritize products from the same brand when suitable.

7. If the user purchased smartphones,
   prioritize other smartphones, mobile accessories,
   or related electronics.

8. DO NOT recommend completely unrelated categories.

9. Example:
   If the user purchased Samsung smartphones,
   do NOT recommend refrigerators, water purifiers,
   bulbs, or unrelated appliances.

10. Do not recommend products already present in:
    - wishlist
    - cart
    - orders

11. Only recommend products that exist in the AVAILABLE PRODUCTS list.

12. Never invent product IDs.

13. Return maximum 5 products.

14. Rank recommendations from most relevant to least relevant.

15. If there are not enough highly relevant products,
    return fewer products instead of recommending unrelated products.

========================
OUTPUT FORMAT
========================

Return ONLY valid JSON.

{
  "productIds": [
    "productId1",
    "productId2",
    "productId3"
  ]
}
`;

    // -----------------------------------------
    // 8. Ask Gemini
    // -----------------------------------------

    const aiResponse =
      await askGemini(prompt);

    console.log(
      "Gemini Response:",
      aiResponse
    );

    // -----------------------------------------
    // 9. Clean Gemini response
    // -----------------------------------------

    const cleanedResponse =
      aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    let parsedResponse;

    try {
      parsedResponse =
        JSON.parse(cleanedResponse);
    } catch (error) {

      console.error(
        "Gemini JSON Parse Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Invalid response from AI",
      });
    }

    // -----------------------------------------
    // 10. Get recommended product IDs
    // -----------------------------------------

    const productIds =
      parsedResponse.productIds || [];

    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        products: [],
      });
    }

    // -----------------------------------------
    // 11. Get actual products from MongoDB
    // -----------------------------------------

    const recommendations =
      await Product.find({
        _id: {
          $in: productIds,
        },
      });

    // -----------------------------------------
    // 12. Send recommendations
    // -----------------------------------------

    return res.status(200).json({
      success: true,
      products: recommendations,
    });

  } catch (error) {

    console.error(
      "Personalized Recommendation Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const getRecommendations = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
     console.log("🔥 getRecommendations CALLED");
  console.log("Product ID:", req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Step 1 - Related Products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    let aiProducts = [];

    try {
      // Step 2 - AI Suggestions
      const prompt = `
Recommend products similar to:
"${product.title}"

Return only product names separated by commas.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const names = response.text
        .split(",")
        .map((n) => n.trim());

      aiProducts = await Product.find({
        title: {
          $in: names.map((n) => new RegExp(n, "i")),
        },
        _id: { $ne: product._id },
      });

    } catch (err) {
      console.log("AI failed. Using related products only.");
    }

    // Step 3 - Merge & Remove Duplicates
    const map = new Map();

    [...relatedProducts, ...aiProducts].forEach((item) => {
      map.set(item._id.toString(), item);
    });

    const recommendations = [...map.values()].slice(0, 8);

    res.json({
      success: true,
      recommendations,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




module.exports = {
  getRecommendations, getPersonalizedRecommendations
};