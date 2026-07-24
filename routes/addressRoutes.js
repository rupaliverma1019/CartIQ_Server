const express = require("express");

const router = express.Router();

const { protect } =
require("../middleware/authMiddleware");

const {addAddress,getAddresses,updateAddress,deleteAddress,} = require("../controllers/addressController");

router.post("/", protect, addAddress);

router.get("/", protect, getAddresses);

router.put("/:addressId", protect, updateAddress);

router.delete("/:addressId", protect, deleteAddress);

module.exports = router;