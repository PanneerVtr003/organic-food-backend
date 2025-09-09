import Order from "../models/Order.js"; // fixed import

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      orderItems,
      user: req.user?._id || null, // safe for testing
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice: shippingPrice || 0,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Order creation failed:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
