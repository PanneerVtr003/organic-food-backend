import express from "express";
import Order from "../models/Order.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Place Order Route
router.post("/", async (req, res) => {
  try {
    const { items, totalPrice, deliveryInfo, paymentMethod } = req.body;

    // 1. Save order to DB
    const newOrder = new Order({
      items,
      totalPrice,
      deliveryInfo,
      paymentMethod,
    });

    await newOrder.save();

    // 2. Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // you can also use Outlook, Mailtrap, etc.
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    // 3. Build Email Content
    const itemsList = items
      .map(
        (item) =>
          `<li>${item.name} - ${item.quantity} x ₹${item.price} = ₹${
            item.quantity * item.price
          }</li>`
      )
      .join("");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: deliveryInfo.email, // send to user
      subject: "🛒 Order Confirmation - Organic Delivery",
      html: `
        <h2>Hello ${deliveryInfo.name},</h2>
        <p>Thank you for your order! 🎉</p>
        <h3>📦 Order Details:</h3>
        <ul>${itemsList}</ul>
        <p><b>Total Price:</b> ₹${totalPrice}</p>
        <h3>🚚 Delivery Info:</h3>
        <p>
          ${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.zipCode}<br/>
          📞 ${deliveryInfo.phone}
        </p>
        <p><b>Payment Method:</b> ${paymentMethod}</p>
        <p>We’ll notify you once your order is out for delivery 🚀</p>
        <br/>
        <p>Thanks,<br/>Organic Delivery Team 🌱</p>
      `,
    };

    // 4. Send Email
    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Order placed successfully! Confirmation email sent.",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Order Error:", error);
    res.status(500).json({ message: "Order failed", error });
  }
});

export default router;
