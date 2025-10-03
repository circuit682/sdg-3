// routes/dashboard.js
const express = require('express');
const router = express.Router();

// Simple protected dashboard route (authentication required)
router.get('/', (req, res) => {
  // You'd check for a valid JWT here in a real app
  res.json({ message: 'Welcome to your dashboard!' });
});

module.exports = router;
