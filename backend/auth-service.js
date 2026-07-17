const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
app.use(express.json());

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/flixstore_auth";
let db;

MongoClient.connect(mongoUri).then(client => { db = client.db(); });

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Identity profile registered." });
    
    const newUser = { id: `USR-${Date.now()}`, email, password, name, phone };
    await db.collection('users').insertOne(newUser);
    res.status(201).json({ token: "session-jwt-wire-token", user: newUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.collection('users').findOne({ email, password });
  if (!user) return res.status(401).json({ message: "Invalid client access signatures." });
  res.status(200).json({ token: "session-jwt-wire-token", user });
});

app.get('/health', (req, res) => res.status(200).json({ status: "ALIVE" }));
app.listen(5001, () => console.log("Auth System Operational."));
module.exports = app;