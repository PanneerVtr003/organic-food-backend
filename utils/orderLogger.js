import OrderLog from '../models/OrderLog.js';

// Optional: If you want to maintain a separate log collection
export const logOrderToMongo = async (order) => {
  try {
    const orderLog = new OrderLog({
      orderId: order._id,
      userId: order.user,
      customerInfo: order.customerInfo,
      totalAmount: order.totalAmount,
      status: order.status,
      items: order.items,
      timestamp: new Date()
    });
    
    await orderLog.save();
  } catch (error) {
    console.error('Failed to log order to MongoDB:', error);
  }
};