const Product = require("../models/Product");
const { askGemini } = require("../services/geminiService");

const searchProductsAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    // ============================================
    // 1. Extract price information from user prompt
    // ============================================

    const userPrompt = prompt.toLowerCase();

    let priceFilter = {};

    const parseAmount = (value, unit) => {
      let amount = parseFloat(value.replace(/,/g, ""));

      if (unit) {
        unit = unit.toLowerCase();

        if (unit === "k" || unit === "thousand") {
          amount = amount * 1000;
        }

        if (unit === "lakh" || unit === "lac") {
          amount = amount * 100000;
        }
      }

      return amount;
    };

    // ============================================
    // 2. Detect "between X and Y"
    // ============================================

    const betweenMatch = userPrompt.match(
      /between\s+(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lac)?\s*(?:and|to|-)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lac)?/i
    );

    if (betweenMatch) {
      const minPrice = parseAmount(
        betweenMatch[1],
        betweenMatch[2]
      );

      const maxPrice = parseAmount(
        betweenMatch[3],
        betweenMatch[4]
      );

      priceFilter.$expr = {
        $and: [
          {
            $gte: [
              {
                $cond: [
                  { $gt: ["$discountPrice", 0] },
                  "$discountPrice",
                  "$price",
                ],
              },
              minPrice,
            ],
          },
          {
            $lte: [
              {
                $cond: [
                  { $gt: ["$discountPrice", 0] },
                  "$discountPrice",
                  "$price",
                ],
              },
              maxPrice,
            ],
          },
        ],
      };
    }

    // ============================================
    // 3. Detect "under / below / less than / upto"
    // ============================================

    if (!betweenMatch) {
      const underMatch = userPrompt.match(
        /(?:under|below|less than|upto|up to|max(?:imum)?|within)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lac)?/i
      );

      if (underMatch) {
        const maxPrice = parseAmount(
          underMatch[1],
          underMatch[2]
        );

        priceFilter.$expr = {
          $lte: [
            {
              $cond: [
                { $gt: ["$discountPrice", 0] },
                "$discountPrice",
                "$price",
              ],
            },
            maxPrice,
          ],
        };
      }
    }

    // ============================================
    // 4. Detect "above / over / more than"
    // ============================================

    if (!betweenMatch && Object.keys(priceFilter).length === 0) {
      const aboveMatch = userPrompt.match(
        /(?:above|over|more than|greater than|starting from|minimum)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lac)?/i
      );

      if (aboveMatch) {
        const minPrice = parseAmount(
          aboveMatch[1],
          aboveMatch[2]
        );

        priceFilter.$expr = {
          $gte: [
            {
              $cond: [
                { $gt: ["$discountPrice", 0] },
                "$discountPrice",
                "$price",
              ],
            },
            minPrice,
          ],
        };
      }
    }

    // ============================================
    // 5. Ask Gemini for product keywords
    // ============================================

    const aiPrompt = `
You are an ecommerce product search assistant.

User request:
"${prompt}"

Extract ONLY specific product-related search terms.

IMPORTANT RULES:

- Return ONLY comma-separated keywords.
- Do NOT return prices.
- Do NOT return words like "under", "above", "below".
- Do NOT return generic words such as:
  electronics, gadgets, products, items, accessories,
  technology, device, devices.
- Focus on the actual product the user wants.

Examples:

User: "smart watch"
Return:
watch,smartwatch,smart watch,digital watch,fitness watch,gps watch

User: "gaming laptop"
Return:
gaming laptop,gaming,laptop

User: "wireless earphones"
Return:
wireless earphones,earphones,earbuds,bluetooth earphones

User: "samsung phone"
Return:
samsung,phone,mobile,smartphone

User: "running shoes"
Return:
running shoes,running,sports shoes,sneakers

User: "phone under 30000"
Return:
phone,mobile,smartphone

Do not include:
electronics,gadgets,products,items,accessories,
technology,device,devices,prices,numbers
`;

    const keywords = await askGemini(aiPrompt);

    // ============================================
    // 6. Convert Gemini response to array
    // ============================================

    const keywordArray = keywords
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    // ============================================
    // 7. Remove generic keywords and prices
    // ============================================

    const genericKeywords = [
      "electronics",
      "gadgets",
      "products",
      "product",
      "items",
      "item",
      "accessories",
      "technology",
      "tech",
      "device",
      "devices",
      "prices",
      "price",
      "under",
      "above",
      "below",
      "upto",
      "up to",
    ];

    const filteredKeywords = keywordArray.filter((keyword) => {
      // Remove generic words
      if (genericKeywords.includes(keyword)) {
        return false;
      }

      // Remove numbers
      if (/^\d+(?:\.\d+)?$/.test(keyword)) {
        return false;
      }

      return true;
    });

    // ============================================
    // 8. Escape regex characters
    // ============================================

    const escapeRegex = (text) => {
      return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    const regexKeywords = filteredKeywords.map(escapeRegex);

    if (regexKeywords.length === 0) {
      return res.json({
        success: true,
        keywords,
        count: 0,
        products: [],
      });
    }

    const regex = regexKeywords.join("|");

    // ============================================
    // 9. Build MongoDB search query
    // ============================================

    const searchQuery = {
      isActive: true,

      // Price filter is added here
      ...priceFilter,

      $or: [
        {
          title: {
            $regex: regex,
            $options: "i",
          },
        },
        {
          description: {
            $regex: regex,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: regex,
            $options: "i",
          },
        },
      ],
    };

    // ============================================
    // 10. Find products
    // ============================================

    const products = await Product.find(searchQuery);

    // ============================================
    // 11. Calculate relevance score
    // ============================================

    const scoredProducts = products.map((product) => {
      const title = product.title.toLowerCase();
      const description = product.description.toLowerCase();
      const brand = (product.brand || "").toLowerCase();

      let score = 0;

      filteredKeywords.forEach((keyword) => {
        const word = keyword.toLowerCase();

        // Title = strongest
        if (title.includes(word)) {
          score += 10;
        }

        // Brand = strong
        if (brand.includes(word)) {
          score += 7;
        }

        // Description = weaker
        if (description.includes(word)) {
          score += 3;
        }
      });

      return {
        product,
        score,
      };
    });

    // ============================================
    // 12. Sort by relevance
    // ============================================

    scoredProducts.sort((a, b) => b.score - a.score);

    // ============================================
    // 13. Return final products
    // ============================================

    const finalProducts = scoredProducts
      .filter((item) => item.score > 0)
      .slice(0, 12)
      .map((item) => item.product);

    return res.json({
      success: true,
      keywords,
      count: finalProducts.length,
      products: finalProducts,
    });
  } catch (error) {
    console.error("AI SEARCH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  searchProductsAI,
};