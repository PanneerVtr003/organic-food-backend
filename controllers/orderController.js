import mongoose from "mongoose";
import Order from "../models/Order.js";

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

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Convert food IDs to ObjectIds
    const orderItemsWithObjectIds = orderItems.map(item => ({
      ...item,
      food: new mongoose.Types.ObjectId(item.food)
    }));

    const order = new Order({
      orderItems: orderItemsWithObjectIds,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice: shippingPrice || 0,
      totalPrice,
      sendEmailConfirmation: sendEmailConfirmation || false
    });

    const createdOrder = await order.save();
    
    // Populate food details
    await createdOrder.populate({
      path: 'orderItems.food',
      select: 'name image'
    });
    
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Order creation failed:", error.message);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation Error", 
        error: error.message 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid ID format", 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message,
    });
  }
};