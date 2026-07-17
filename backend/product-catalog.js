const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
app.use(express.json());

// 1. Point this dynamically to your production network configurations
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/flixstore_catalog";
let db;

// 2. Wrap server listen inside the connection lifecycle block
MongoClient.connect(mongoUri)
  .then(async (client) => {
    db = client.db();
    console.log("🟢 Connected successfully to MongoDB Database Context");

    // Pre-hydrate catalog collections if empty
    const count = await db.collection('products').countDocuments();
    if (count === 0) {
      await db.collection('products').insertMany([
        { id: "101", name: "Stranger Things Retro Hoodie", priceUSD: 49.99, description: "Hawkins High School edition.", imageUrl: "https://www.bearbroidery.com/cdn/shop/files/stranger_things_new_black_black_front_hoodie.png?v=1729493365" },
        { id: "102", name: "Squid Game Tracksuit", priceUSD: 39.99, description: "Authentic player 456 premium uniform.", imageUrl: "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcSquODS35BAoRm6-YkV8-sddM4f2DgO_Rj4oZoKnFdO6t5Yx70kFV-O_GBE_sakFe6FVUNLF_BwfOx1bPE" },
        { id: "103", name: "Witcher Wolf Medallion", priceUSD: 19.99, description: "Solid dark silver wolf jewelry structure.", imageUrl: "https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcQChiyAtS1gk_YKOLKza70fKoN9kjfjbAc0C2iFg1clHHXNJm3unhvn1Gxxx4zdq9LmfdsP_9zoPB3VzgE" }
      ]);
    }

    // Bind port only after connection is active
    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => console.log(`🚀 Catalog Service running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ Critical Database Connection Failure:", err);
    process.exit(1);
  });

app.get('/api/products', async (req, res) => {
  if (!db) return res.status(500).json({ error: "Database initializing..." });
  const items = await db.collection('products').find({}).toArray();
  res.status(200).json(items);
});

// Keep your existing /api/products/search route underneath here...
module.exports = app;