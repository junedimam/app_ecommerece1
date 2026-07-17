const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/flixstore_catalog";
let db;

MongoClient.connect(mongoUri).then(async (client) => {
  db = client.db();
  // Hydrate structural index constraints and initial seed values down if empty
  const count = await db.collection('products').countDocuments();
  if (count === 0) {
    await db.collection('products').insertMany([
      { id: "101", name: "Stranger Things Retro Hoodie", priceUSD: 49.99, description: "Hawkins High School edition.", imageUrl: "https://www.bearbroidery.com/cdn/shop/files/stranger_things_new_black_black_front_hoodie.png?v=1729493365" },
      { id: "102", name: "Squid Game Tracksuit", priceUSD: 39.99, description: "Authentic player 456 premium uniform.", imageUrl: "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcSquODS35BAoRm6-YkV8-sddM4f2DgO_Rj4oZoKnFdO6t5Yx70kFV-O_GBE_sakFe6FVUNLF_BwfOx1bPE" },
      { id: "103", name: "Witcher Wolf Medallion", priceUSD: 19.99, description: "Solid dark silver wolf jewelry structure.", imageUrl: "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcQChiyAtS1gk_YKOLKza70fKoN9kjfjbAc0C2iFg1clHHXNJm3unhvn1Gxxx4zdq9LmfdsP_9zoPB3VzgE" }
    ]);
  }
});

app.get('/api/products', async (req, res) => {
  const items = await db.collection('products').find({}).toArray();
  res.status(200).json(items);
});

app.get('/api/products/search', async (req, res) => {
  const queries = req.query.q || '';
  const searchResults = await db.collection('products').find({
    $or: [
      { name: { $regex: queries, $options: 'i' } },
      { description: { $regex: queries, $options: 'i' } }
    ]
  }).toArray();
  res.status(200).json(searchResults);
});

app.listen(5002);
module.exports = app;