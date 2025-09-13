import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    name: { type: String },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: [arr => arr.length > 0, "Order must have at least one item"]
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippingAddress: {
      name: { type: String, required: true },
      email: { type: String, required: true, match: /.+\@.+\..+/ },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["credit-card", "paypal", "cash"],
    },
    itemsPrice: { type: Number, required: true, min: 0 },
    taxPrice: { type: Number, default: 0.0, min: 0 },
    shippingPrice: { type: Number, default: 0.0, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    sendEmailConfirmation: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
