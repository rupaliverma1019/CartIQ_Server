const calculateCart = async (cart) => {

  cart.subtotal = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  cart.shipping = cart.subtotal > 1000 ? 0 : 100;

  cart.tax = Number((cart.subtotal * 0.18).toFixed(2));

  cart.total =
    cart.subtotal +
    cart.shipping +
    cart.tax;
};

module.exports = calculateCart;