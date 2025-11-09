// --- server.js ---
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ✅ STEP 1: Apply CORS globally and FIRST
app.use(
  cors({
    origin: 'http://localhost:3000', // React dev server
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  })
);
app.options(/.*/, cors()); // handles preflight requests

// ✅ STEP 2: Enable JSON parsing
app.use(express.json());

// ✅ STEP 3: Mount API routes
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// ✅ STEP 4: Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// ✅ STEP 5: Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get(/.*/, (req, res) =>
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'))
  );
}

// ✅ STEP 6: Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
