const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Base routes (these are safe to define on import)
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

// ONLY connect to DB and listen on a port if run directly (node server.js)
// This block is completely skipped when Jest imports the file!
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flixstore_auth';

  mongoose.connect(MONGO_URI)
    .then(() => console.log('🟢 Auth Service connected to MongoDB'))
    .catch(err => console.error('🔴 DB Connection failed:', err.message));

  app.listen(PORT, () => console.log(`🚀 Auth Service active on port ${PORT}`));
}

// Export app for Supertest/Jest
module.exports = app;