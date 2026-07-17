const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// Cart Schema
const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String },
      priceUSD: { type: Number },
      quantity: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);

// Health check
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

// GET /api/cart/:userId - Fetch active cart
app.get('/api/cart/:userId', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      cart = await Cart.create({ userId: req.params.userId, items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/:userId - Update cart items
app.post('/api/cart/:userId', async (req, res) => {
  try {
    const { items } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userId: req.params.userId },
      { items },
      { new: true, upsert: true }
    );
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/cart/add - Add item to cart
app.post('/api/cart/add', async (req, res) => {
  try {
    const { userId, productId, name, priceUSD } = req.body;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    const existingItem = cart.items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ productId, name, priceUSD, quantity: 1 });
    }
    
    await cart.save();
    res.status(200).json({ status: "Item added to cart", cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/cart/remove - Remove item from cart
app.delete('/api/cart/remove', async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    res.status(200).json({ status: "Item removed", cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 5003;
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flixstore_cart';

  mongoose.connect(MONGO_URI)
    .then(() => console.log('🟢 Cart Service connected to MongoDB'))
    .catch(err => console.error('🔴 DB Connection failed:', err.message));

  app.listen(PORT, () => console.log(`🚀 Cart Service active on port ${PORT}`));
}

module.exports = app;