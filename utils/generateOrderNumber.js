const generateOrderNumber = () => {
  return (
    "ORD-" +
    Date.now() +
    "-" +
    Math.floor(Math.random() * 1000)
  );
};

module.exports = generateOrderNumber;