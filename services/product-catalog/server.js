const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5002;
// Points to your local Mongo or your K8s service name. Separated logically by database path.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flixstore_products';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🟢 Product Catalog connected to MongoDB'))
  .catch(err => console.error('🔴 DB Connection failed:', err.message));

// Schema definition
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String
});

const Product = mongoose.model('Product', ProductSchema);

// GET /api/products - Retrieve catalog
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products - Add product (seed database)
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Product Service running on port ${PORT}`));