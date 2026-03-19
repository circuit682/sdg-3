const express = require('express');
const { Consultations } = require('../models');
const authenticate = require('../middleware/authenticate');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const consultations = await Consultations.findAll({
      where: { user_id: req.userId },
      order: [['date', 'DESC']]
    });
    return sendSuccess(res, 'Consultations retrieved successfully', consultations);
  } catch (error) {
    return sendError(res, 'Failed to retrieve consultations');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const consultation = await Consultations.findOne({
      where: { consultation_id: req.params.id, user_id: req.userId }
    });

    if (!consultation) {
      return sendError(res, 'Consultation not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, 'Consultation retrieved successfully', consultation);
  } catch (error) {
    return sendError(res, 'Failed to retrieve consultation');
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      user_id: req.userId
    };

    const consultation = await Consultations.create(payload);
    return sendSuccess(res, 'Consultation created successfully', consultation, 201);
  } catch (error) {
    return sendError(res, 'Failed to create consultation');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedCount] = await Consultations.update(req.body, {
      where: { consultation_id: req.params.id, user_id: req.userId }
    });

    if (!updatedCount) {
      return sendError(res, 'Consultation not found', 404, 'NOT_FOUND');
    }

    const consultation = await Consultations.findOne({
      where: { consultation_id: req.params.id, user_id: req.userId }
    });

    return sendSuccess(res, 'Consultation updated successfully', consultation);
  } catch (error) {
    return sendError(res, 'Failed to update consultation');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Consultations.destroy({ where: { consultation_id: req.params.id, user_id: req.userId } });

    if (!deleted) {
      return sendError(res, 'Consultation not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, 'Consultation deleted successfully', null);
  } catch (error) {
    return sendError(res, 'Failed to delete consultation');
  }
});

module.exports = router;
