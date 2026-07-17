const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const app = express();
app.use(express.json());

// Endpoint to add a fresh item with price and image path assigned
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, imageUrl, stock } = req.body;
    
    const newProduct = new Product({
      name,
      description,
      price,
      imageUrl,
      stock
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Endpoint to fetch all items for your storefront catalog
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

// Execution safety block for native run vs test runner isolation
if (require.main === module) {
  const PORT = process.env.PORT || 5002;
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flixstore_products';

  mongoose.connect(MONGO_URI)
    .then(() => console.log('🟢 Product Catalog connected to MongoDB'))
    .catch(err => console.error('🔴 DB Connection failed:', err.message));

  app.listen(PORT, () => console.log(`🚀 Product Catalog active on port ${PORT}`));
}

module.exports = app;