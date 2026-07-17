const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5003;
// Points to your local Mongo or your K8s service name. Separated logically by database path.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flixstore_cart';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🟢 Cart Service connected to MongoDB'))
  .catch(err => console.error('🔴 DB Connection failed:', err.message));

// Schema definition
const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, default: 1 }
    }
  ]
});

const Cart = mongoose.model('Cart', CartSchema);

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

app.listen(PORT, () => console.log(`🚀 Cart Service running on port ${PORT}`));
