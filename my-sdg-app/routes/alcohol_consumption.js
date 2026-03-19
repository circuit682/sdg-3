const express = require('express');
const { Alcohol_Consumption } = require('../models');
const authenticate = require('../middleware/authenticate');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const records = await Alcohol_Consumption.findAll({
      where: { user_id: req.userId },
      order: [['date', 'DESC']]
    });
    return sendSuccess(res, 'Consumption records retrieved successfully', records);
  } catch (error) {
    return sendError(res, 'Failed to retrieve records');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const record = await Alcohol_Consumption.findOne({
      where: { consumption_id: req.params.id, user_id: req.userId }
    });

    if (!record) {
      return sendError(res, 'Record not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, 'Consumption record retrieved successfully', record);
  } catch (error) {
    return sendError(res, 'Failed to retrieve record');
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      user_id: req.userId
    };
    const record = await Alcohol_Consumption.create(payload);
    return sendSuccess(res, 'Consumption record created successfully', record, 201);
  } catch (error) {
    return sendError(res, 'Failed to create record');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedCount] = await Alcohol_Consumption.update(req.body, {
      where: { consumption_id: req.params.id, user_id: req.userId }
    });

    if (!updatedCount) {
      return sendError(res, 'Record not found', 404, 'NOT_FOUND');
    }

    const record = await Alcohol_Consumption.findOne({
      where: { consumption_id: req.params.id, user_id: req.userId }
    });

    return sendSuccess(res, 'Consumption record updated successfully', record);
  } catch (error) {
    return sendError(res, 'Failed to update record');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Alcohol_Consumption.destroy({ where: { consumption_id: req.params.id, user_id: req.userId } });

    if (!deleted) {
      return sendError(res, 'Record not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, 'Consumption record deleted successfully', null);
  } catch (error) {
    return sendError(res, 'Failed to delete record');
  }
});

module.exports = router;
