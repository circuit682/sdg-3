const bcrypt = require('bcrypt');
const express = require('express');
const { Users } = require('../models');
const authenticate = require('../middleware/authenticate');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const router = express.Router();

router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (req.userId !== userId) {
      return sendError(res, 'Forbidden user access', 403, 'FORBIDDEN');
    }

    const user = await Users.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return sendError(res, 'User not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, 'User retrieved successfully', user);
  } catch (error) {
    return sendError(res, 'Failed to retrieve user');
  }
});

router.post('/', async (req, res) => {
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
    const user = await Users.create({
      name,
      email,
      password: hashedPassword
    });

    return sendSuccess(res, 'User registered successfully', {
      id: user.id,
      name: user.name,
      email: user.email
    }, 201);
  } catch (error) {
    console.error('Error during registration:', error);
    return sendError(res, 'Failed to create user');
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (req.userId !== userId) {
      return sendError(res, 'Forbidden user access', 403, 'FORBIDDEN');
    }

    const { password, ...safeUpdates } = req.body;
    const [updatedCount] = await Users.update(safeUpdates, { where: { id: userId } });

    if (!updatedCount) {
      return sendError(res, 'User not found', 404, 'NOT_FOUND');
    }

    const user = await Users.findByPk(userId, { attributes: { exclude: ['password'] } });
    return sendSuccess(res, 'User updated successfully', user);
  } catch (error) {
    return sendError(res, 'Failed to update user');
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (req.userId !== userId) {
      return sendError(res, 'Forbidden user access', 403, 'FORBIDDEN');
    }

    const deleted = await Users.destroy({ where: { id: userId } });
    if (!deleted) {
      return sendError(res, 'User not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, 'User deleted successfully', null);
  } catch (error) {
    return sendError(res, 'Failed to delete user');
  }
});

module.exports = router;

