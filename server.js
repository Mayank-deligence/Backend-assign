// --- server.js ---
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ✅ STEP 1: Apply CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://frontend-assign-psi.vercel.app", // your frontend domain
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  })
);

app.options(/.*/, cors());

// ✅ STEP 2: Middleware
app.use(express.json());

// ✅ STEP 3: Routes
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// ✅ STEP 4: MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// ✅ STEP 5: Serve frontend only in production (if deployed elsewhere)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get(/.*/, (req, res) =>
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'))
  );
}

// ✅ STEP 6: Export app for Vercel, and listen only if running locally
if (process.env.VERCEL) {
  module.exports = app; // for Vercel serverless deployment
} else {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
