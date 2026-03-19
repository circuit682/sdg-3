const express = require('express');
const { Self_Assessment } = require('../models');
const authenticate = require('../middleware/authenticate');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const assessments = await Self_Assessment.findAll({
      where: { user_id: req.userId },
      order: [['date', 'DESC']]
    });
    return sendSuccess(res, 'Assessments retrieved successfully', assessments);
  } catch (error) {
    return sendError(res, 'Failed to retrieve assessments');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const assessment = await Self_Assessment.findOne({
      where: { assessment_id: req.params.id, user_id: req.userId }
    });

    if (!assessment) {
      return sendError(res, 'Assessment not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, 'Assessment retrieved successfully', assessment);
  } catch (error) {
    return sendError(res, 'Failed to retrieve assessment');
  }
});

router.post('/', async (req, res) => {
  try {
    const assessmentPayload = {
      ...req.body,
      user_id: req.userId
    };

    const assessment = await Self_Assessment.create(assessmentPayload);
    return sendSuccess(res, 'Assessment created successfully', assessment, 201);
  } catch (error) {
    return sendError(res, 'Failed to create assessment');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedCount] = await Self_Assessment.update(req.body, {
      where: { assessment_id: req.params.id, user_id: req.userId }
    });

    if (!updatedCount) {
      return sendError(res, 'Assessment not found', 404, 'NOT_FOUND');
    }

    const assessment = await Self_Assessment.findOne({ where: { assessment_id: req.params.id, user_id: req.userId } });
    return sendSuccess(res, 'Assessment updated successfully', assessment);
  } catch (error) {
    return sendError(res, 'Failed to update assessment');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Self_Assessment.destroy({ where: { assessment_id: req.params.id, user_id: req.userId } });

    if (!deleted) {
      return sendError(res, 'Assessment not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, 'Assessment deleted successfully', null);
  } catch (error) {
    return sendError(res, 'Failed to delete assessment');
  }
});

module.exports = router;
