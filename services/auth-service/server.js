const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Health check
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    
    const newUser = new User({
      id: `USR-${Date.now()}`,
      email,
      password,
      name,
      phone
    });
    
    await newUser.save();
    res.status(201).json({
      token: `jwt-${newUser.id}-${Date.now()}`,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, phone: newUser.phone }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.status(200).json({
      token: `jwt-${user.id}-${Date.now()}`,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flixstore_auth';

  mongoose.connect(MONGO_URI)
    .then(() => console.log('🟢 Auth Service connected to MongoDB'))
    .catch(err => console.error('🔴 DB Connection failed:', err.message));

  app.listen(PORT, () => console.log(`🚀 Auth Service active on port ${PORT}`));
}

module.exports = app;