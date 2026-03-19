const express = require('express');
const { Goals } = require('../models');
const authenticate = require('../middleware/authenticate');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const goals = await Goals.findAll({
      where: { user_id: req.userId },
      order: [['createdAt', 'DESC']]
    });
    return sendSuccess(res, 'Goals retrieved successfully', goals);
  } catch (error) {
    return sendError(res, 'Failed to retrieve goals');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const goal = await Goals.findOne({
      where: { goal_id: req.params.id, user_id: req.userId }
    });

    if (!goal) {
      return sendError(res, 'Goal not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, 'Goal retrieved successfully', goal);
  } catch (error) {
    return sendError(res, 'Failed to retrieve goal');
  }
});

router.post('/', async (req, res) => {
  try {
    const goalPayload = {
      ...req.body,
      user_id: req.userId
    };

    const goal = await Goals.create(goalPayload);
    return sendSuccess(res, 'Goal created successfully', goal, 201);
  } catch (error) {
    return sendError(res, 'Failed to create goal');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedCount] = await Goals.update(req.body, {
      where: { goal_id: req.params.id, user_id: req.userId }
    });

    if (!updatedCount) {
      return sendError(res, 'Goal not found', 404, 'NOT_FOUND');
    }

    const goal = await Goals.findOne({ where: { goal_id: req.params.id, user_id: req.userId } });
    return sendSuccess(res, 'Goal updated successfully', goal);
  } catch (error) {
    return sendError(res, 'Failed to update goal');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Goals.destroy({ where: { goal_id: req.params.id, user_id: req.userId } });

    if (!deleted) {
      return sendError(res, 'Goal not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, 'Goal deleted successfully', null);
  } catch (error) {
    return sendError(res, 'Failed to delete goal');
  }
});

module.exports = router;
