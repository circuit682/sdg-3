const express = require('express');
const { Goals, Self_Assessment, Alcohol_Consumption } = require('../models');
const authenticate = require('../middleware/authenticate');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [goalsCount, assessmentsCount, consumptionCount] = await Promise.all([
      Goals.count({ where: { user_id: req.userId } }),
      Self_Assessment.count({ where: { user_id: req.userId } }),
      Alcohol_Consumption.count({ where: { user_id: req.userId } })
    ]);

    return sendSuccess(res, 'Dashboard summary retrieved successfully', {
      goalsCount,
      assessmentsCount,
      consumptionCount
    });
  } catch (error) {
    return sendError(res, 'Failed to load dashboard summary');
  }
});

module.exports = router;
