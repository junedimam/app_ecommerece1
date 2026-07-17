// services/auth-service/server.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flixstore_auth';

mongoose.connect(MONGO_URI)
  .then(() => console.log('�� Auth Service connected to MongoDB'))
  .catch(err => console.error('🔴 DB Connection failed:', err.message));

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.listen(PORT, () => console.log(`🚀 Auth Service active on port ${PORT}`));
