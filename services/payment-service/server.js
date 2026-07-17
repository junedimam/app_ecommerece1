const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flixstore_payments';
let db;

MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db();
    console.log('🟢 Payment Service connected to MongoDB');
  })
  .catch(err => console.error('🔴 DB Connection failed:', err.message));

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.post('/api/payments/charge', async (req, res) => {
  try {
    const { userId, amount, method, pin } = req.body;
    
    if (!pin || pin.length < 4) {
      return res.status(400).json({ message: "Invalid Transaction Security Pin Code" });
    }

    const record = {
      userId,
      amountUSD: amount,
      channel: method,
      transactionId: `TXN-FLIX-${Math.floor(Math.random() * 899999 + 100000)}`,
      timestamp: new Date()
    };

    await db.collection('transactions').insertOne(record);
    res.status(200).json({ status: "Settled", transactionId: record.transactionId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 Payment Service active on port ${PORT}`));
}

module.exports = app;