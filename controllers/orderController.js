import mongoose from "mongoose";
import Order from "../models/Order.js";

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
      sendEmailConfirmation
    } = req.body;

    // Validate order items
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    // Validate required shipping address fields
    const requiredAddressFields = ["name", "email", "phone", "street", "city", "state", "zipCode"];
    for (let field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return res.status(400).json({ message: `Missing shipping address field: ${field}` });
      }
    }

    // Validate payment method
    const validPaymentMethods = ["credit-card", "paypal", "cod"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // Convert food IDs safely
    const orderItemsWithObjectIds = orderItems.map((item) => {
      if (!item.food || !mongoose.Types.ObjectId.isValid(item.food)) {
        throw new Error(`Invalid food ID: ${item.food}`);
      }
      return {
        ...item,
        food: mongoose.Types.ObjectId(item.food)
      };
    });

    // Create order
    const order = new Order({
      orderItems: orderItemsWithObjectIds,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalPrice,
      sendEmailConfirmation: sendEmailConfirmation || false
    });

    const createdOrder = await order.save();

    // Populate food details
    await createdOrder.populate({
      path: "orderItems.food",
      select: "name image"
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Order creation error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation Error", error: error.message });
    }

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
