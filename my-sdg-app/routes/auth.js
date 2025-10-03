// routes/auth.js
const express = require('express');
const router = express.Router();
const { Users } = require('../models'); // Assuming Users model is in models/user.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // For JWT authentication

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Users.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});


// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful', token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // Here you can handle logout by removing the JWT token on the frontend
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
