const express = require('express');
const router = express.Router();
const Order = require('../Models/Order');

// Generate unique tracking ID (e.g., AyluxMajesty001)
const generateTrackingId = async () => {
  const count = await Order.countDocuments();
  const nextNumber = count + 1;
  const paddedNumber = nextNumber.toString().padStart(3, '0');
  return `AyluxMajesty${paddedNumber}`;
};

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { customer, items, subtotal, shipping, tax, totalAmount } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const trackingId = await generateTrackingId();

    const order = new Order({
      trackingId,
      customer,
      items,
      subtotal,
      shipping,
      tax,
      totalAmount
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (for Admin Dashboard)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Order Stats (Overview Tab)
router.get('/stats', async (req, res) => {
  try {
    const orders = await Order.find({});
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    
    // Unique customers based on email
    const uniqueEmails = new Set(orders.map(o => o.customer.email));
    const activeCustomers = uniqueEmails.size;
    
    // Recent activities (last 5 orders)
    const recentActivities = await Order.find({}).sort({ createdAt: -1 }).limit(5).select('trackingId customer status createdAt');

    res.json({
      totalRevenue,
      totalOrders,
      activeCustomers,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Customers List
router.get('/customers', async (req, res) => {
  try {
    const orders = await Order.find({});
    const customersMap = {};

    orders.forEach(order => {
      const email = order.customer.email;
      if (!customersMap[email]) {
        customersMap[email] = {
          name: `${order.customer.firstName} ${order.customer.lastName}`,
          email: email,
          orders: 0,
          spent: 0
        };
      }
      customersMap[email].orders += 1;
      customersMap[email].spent += order.totalAmount;
    });

    const customersArray = Object.values(customersMap).sort((a, b) => b.spent - a.spent);
    res.json(customersArray);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order by tracking ID
router.get('/:trackingId', async (req, res) => {
  try {
    const order = await Order.findOne({ trackingId: req.params.trackingId.trim() });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Order Status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, carrier, courierTrackingId } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status) order.status = status;
    if (carrier !== undefined) order.carrier = carrier;
    if (courierTrackingId !== undefined) order.courierTrackingId = courierTrackingId;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
