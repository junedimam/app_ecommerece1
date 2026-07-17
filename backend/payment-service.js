const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
app.use(express.json());

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/flixstore_payments";
let db;
MongoClient.connect(mongoUri).then(client => { db = client.db(); });

app.post('/api/payments/charge', async (req, res) => {
  const { userId, amount, method, pin } = req.body;
  
  // Real-world operational fallback authorization pin schema logic validation check
  if (!pin || pin.length < 4) return res.status(400).json({ message: "Invalid Transaction Security Pin Code Payload" });

  const record = {
    userId,
    amountUSD: amount,
    channel: method,
    transactionId: `TXN-FLIX-${Math.floor(Math.random() * 899999 + 100000)}`,
    timestamp: new Date()
  };

  await db.collection('transactions').insertOne(record);
  res.status(200).json({ status: "Settled", transactionId: record.transactionId });
});

app.listen(5005);
module.exports = app;