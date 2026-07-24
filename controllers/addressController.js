const User = require("../models/User");


// addAddress() 
const addAddress = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if (req.body.isDefault) {

      user.addresses.forEach(address => {
        address.isDefault = false;
      });

    }

    user.addresses.push(req.body);

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const getAddresses = async (req, res) => {

  const user = await User.findById(req.user._id);

  return res.status(200).json({

    success: true,

    addresses: user.addresses,

  });

};

const updateAddress = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    const address =
      user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (req.body.isDefault) {

      user.addresses.forEach(item => {
        item.isDefault = false;
      });

    }

    Object.assign(address, req.body);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated",
      addresses: user.addresses,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const deleteAddress = async (req, res) => {

  const user =
    await User.findById(req.user._id);

  user.addresses.pull(
    req.params.addressId
  );

  await user.save();

  return res.status(200).json({

    success: true,

    message: "Address deleted",

  });

};


module.exports = { addAddress , getAddresses , updateAddress , deleteAddress}


