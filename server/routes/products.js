const router = require('express').Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { protect, adminOnly, asyncHandler } = require('../middleware/auth');

const fields = ['name', 'description', 'price', 'image', 'category', 'stock'];
const pick = (body) => Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, category, sort } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const filter = {};
    if (q) filter.name = { $regex: String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (category && category !== 'All') filter.category = category;
    const sorts = { priceAsc: { price: 1 }, priceDesc: { price: -1 }, newest: { createdAt: -1 } };
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sorts[sort] || sorts.newest).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter),
    ]);
    res.json({ products, page, pages: Math.ceil(total / limit), total });
  })
);

router.get('/categories', asyncHandler(async (req, res) => res.json(await Product.distinct('category'))));

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Product not found' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  })
);

router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { name, price } = req.body;
    if (!name || price === undefined) return res.status(400).json({ message: 'Name and price are required' });
    res.status(201).json(await Product.create(pick(req.body)));
  })
);

router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  })
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  })
);

module.exports = router;
