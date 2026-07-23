const Product = require("../models/Product");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../utils/uploadToCloudinary");


// create product lesson 8
const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      category,
      brand,
      stock,
      colors,
      sizes,
      seller,
      featured,
    } = req.body;

    // Validation
    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Upload Images to Cloudinary
    const images = [];

if (req.files?.length) {

  const uploadedImages =
    await Promise.all(

      req.files.map(async (file) => {

        const result =
          await uploadToCloudinary(
            file.buffer,
            "products"
          );

        return {
          public_id: result.public_id,
          url: result.secure_url,
        };

      })

    );

  images.push(...uploadedImages);

}

    // Create Product
    const product = await Product.create({
      title,
      description,
      price,
      discountPrice,
      category,
      brand,
      stock,
      colors,
      sizes,
      seller,
      featured,
      images,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

 
// Get All Products API (Search + Filter + Sort + Pagination)  lesson 9
const getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (keyword) {
      filter.title = {
        $regex: keyword,
        $options: "i",
      };
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    let sortOption = { createdAt: -1 };

    if (sort) {
      switch (sort) {
        case "price":
          sortOption = { price: 1 };
          break;

        case "-price":
          sortOption = { price: -1 };
          break;

        case "rating":
          sortOption = { rating: -1 };
          break;

        case "newest":
          sortOption = { createdAt: -1 };
          break;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate("createdBy", "name email");

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / Number(limit)),
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Product API lesson 10

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product = await Product.findById(id)
      .populate("createdBy", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {
    console.error("Get Product Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lesson 11 – Update Product API   revise in Lesson 15 – Update Product Images (Production Ready)
const updateProduct = async (req, res) => {
  try {

    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Replace Images
    if (req.files && req.files.length > 0) {

      // Delete old images
      for (const image of product.images) {
        await cloudinary.uploader.destroy(
          image.public_id
        );
      }

      // Upload new images
      const uploadedImages =
        await Promise.all(

          req.files.map(async (file) => {

            const result =
              await uploadToCloudinary(
                file.buffer,
                "products"
              );

            return {
              public_id: result.public_id,
              url: result.secure_url,
            };

          })

        );

      product.images = uploadedImages;

    }

    Object.assign(product, req.body);

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Lesson 12 - Delete Product API (Soft Delete)

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = false;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.error("Delete Product Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct, getProducts , getProductById , updateProduct , deleteProduct
};