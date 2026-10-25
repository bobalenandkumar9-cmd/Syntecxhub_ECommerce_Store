const router = require('express').Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly, asyncHandler } = require('../middleware/auth');

// Place an order. Prices come from the database, never from the client.
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Your cart is empty' });
    const s = shippingAddress || {};
    if (!s.fullName || !s.phone || !s.address || !s.city || !s.postalCode)
      return res.status(400).json({ message: 'Please complete the shipping address' });

    const reserved = []; // already-deducted stock, for rollback
    const orderItems = [];
    let total = 0;
    try {
      for (const it of items) {
        const qty = parseInt(it.qty);
        if (!qty || qty < 1 || !mongoose.isValidObjectId(it.product))
          throw Object.assign(new Error('Invalid cart item'), { status: 400 });
        // atomic: only decrement if enough stock remains
        const product = await Product.findOneAndUpdate(
          { _id: it.product, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );
        if (!product) throw Object.assign(new Error('An item is out of stock or no longer available'), { status: 409 });
        reserved.push({ id: product._id, qty });
        orderItems.push({ product: product._id, name: product.name, image: product.image, price: product.price, qty });
        total += product.price * qty;
      }
      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress: s,
        paymentMethod: paymentMethod === 'CARD' ? 'CARD' : 'COD',
        totalPrice: Math.round(total * 100) / 100,
      });
      res.status(201).json(order);
    } catch (err) {
      await Promise.all(reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));
      throw err;
    }
  })
);

router.get('/mine', protect, asyncHandler(async (req, res) => res.json(await Order.find({ user: req.user._id }).sort('-createdAt'))));

// ---- admin ----
router.get(
  '/admin/stats',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const [orders, products, users, revenue] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    ]);
    res.json({ orders, products, users, revenue: revenue[0]?.total || 0 });
  })
);

router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => res.json(await Order.find().populate('user', 'name email').sort('-createdAt')))
);

router.put(
  '/:id/status',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!Order.schema.path('status').enumValues.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const wasCancelled = order.status === 'Cancelled';
    if (status === 'Cancelled' && !wasCancelled)
      await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));
    if (status !== 'Cancelled' && wasCancelled)
      await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: -i.qty } })));
    order.status = status;
    await order.save();
    res.json(order);
  })
);

module.exports = router;
