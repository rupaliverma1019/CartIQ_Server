const Product = require("../models/Product");
const User = require("../models/User")
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const { removeAllListeners } = require("../models/User");


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
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      featured,
      page = 1,
      limit = 10,
      sort = "newest",
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = brand;
    }

    if (minPrice || maxPrice) {

      filter.price = {};

      if (minPrice)
        filter.price.$gte =
          Number(minPrice);

      if (maxPrice)
        filter.price.$lte =
          Number(maxPrice);

    }

    if (rating) {

      filter.rating = {

        $gte: Number(rating),

      };

    }

    if (inStock === "true") {

      filter.stock = {

        $gt: 0,

      };

    }

    if (featured === "true") {

      filter.featured = true;

    }

    let sortOption = {};

    switch (sort) {

      case "priceAsc":
        sortOption = {
          price: 1,
        };
        break;

      case "priceDesc":
        sortOption = {
          price: -1,
        };
        break;

      case "rating":
        sortOption = {
          rating: -1,
        };
        break;

      case "popular":
        sortOption = {
          numReviews: -1,
        };
        break;

      default:
        sortOption = {
          createdAt: -1,
        };
    }

    const pageNumber =
      Number(page);

    const pageSize =
      Number(limit);

    const skip =
      (pageNumber - 1) *
      pageSize;

    const products =
      await Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(pageSize);

    const totalProducts =
      await Product.countDocuments(
        filter
      );

    return res.status(200).json({
      success: true,

      page: pageNumber,

      pages: Math.ceil(
        totalProducts /
          pageSize
      ),

      totalProducts,

      products,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        error.message,
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

// Lesson 16 – Product Reviews & Ratings (Production Ready)
const createProductReview = async (req, res) => {
  try {

    const { id } = req.params;

    const { rating, comment } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const alreadyReviewed =
      product.reviews.find(

        review =>
          review.user.toString() ===
          req.user._id.toString()

      );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "Product already reviewed",
      });
    }

    const review = {

      user: req.user._id,

      name: req.user.name,

      rating: Number(rating),

      comment,

    };

    product.reviews.push(review);

    product.numReviews =
      product.reviews.length;

    product.rating =
      product.reviews.reduce(
        (acc, item) =>
          acc + item.rating,
        0
      ) / product.reviews.length;

    await product.save();

    return res.status(201).json({
      success: true,
      message:
        "Review added successfully",
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// addToWishlist Lesson 17 – Wishlist API (Production Ready)
const addToWishlist = async (req, res) => {
  try {

    const { id } = req.params;

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          wishlist: id,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Product added to wishlist",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// removeFromWishlist Lesson 17 – Wishlist API (Production Ready)
const removeFromWishlist =async (req,res)=>{

const {id}=req.params;

await User.findByIdAndUpdate(

req.user._id,

{

$pull:{

wishlist:id

}

}

);

return res.status(200).json({

success:true,

message:"Removed from wishlist"

});

};

const getWishlist =async(req,res)=>{

const user=

await User.findById(req.user._id).populate({
path:"wishlist",
match:{
isActive:true
}
});

return res.status(200).json({

success:true,

wishlist:user.wishlist

});

};


module.exports = {
  createProduct, getProducts , getProductById , updateProduct , deleteProduct , createProductReview ,addToWishlist , removeFromWishlist , getWishlist
};