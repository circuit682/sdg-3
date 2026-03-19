// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Users } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400, 'VALIDATION_ERROR');
    }

    const existing = await Users.findOne({ where: { email } });
    if (existing) {
      return sendError(res, 'Email is already registered', 409, 'EMAIL_TAKEN');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({ name, email, password: hashedPassword });

    return sendSuccess(
      res,
      'User registered successfully',
      { id: user.id, name: user.name, email: user.email },
      201
    );
  } catch (error) {
    console.error('Error during registration:', error);
    return sendError(res, 'Failed to register user');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginEmail = email || username;

    if (!loginEmail || !password) {
      return sendError(res, 'Email and password are required', 400, 'VALIDATION_ERROR');
    }

    const user = await Users.findOne({ where: { email: loginEmail } });
    if (!user) {
      return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    return sendSuccess(res, 'Login successful', {
      token,
      userId: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Failed to login');
  }
});

router.post('/logout', (req, res) => sendSuccess(res, 'Logged out successfully', null));

module.exports = router;
