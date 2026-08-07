const Product = require("../models/Product");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const getRecommendations = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

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
  getRecommendations,
};