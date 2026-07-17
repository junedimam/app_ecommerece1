const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
app.use(express.json());

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/flixstore_cart";
let db;
MongoClient.connect(mongoUri).then(client => { db = client.db(); });

app.get('/api/cart/:userId', async (req, res) => {
  const items = await db.collection('items').find({ userId: req.params.userId }).toArray();
  res.status(200).json(items);
});

app.post('/api/cart/add', async (req, res) => {
  const { userId, productId, name, priceUSD } = req.body;
  const existing = await db.collection('items').findOne({ userId, productId });
  if (existing) {
    await db.collection('items').updateOne({ _id: existing._id }, { $inc: { quantity: 1 } });
  } else {
    await db.collection('items').insertOne({ userId, productId, name, priceUSD, quantity: 1 });
  }
  res.status(200).json({ status: "State Updated Successfully" });
});

app.delete('/api/cart/remove', async (req, res) => {
  const { userId, itemId } = req.body;
  await db.collection('items').deleteOne({ _id: new ObjectId(itemId), userId });
  res.status(200).json({ status: "Item Eviscerated" });
});

app.listen(5003);
module.exports = app;