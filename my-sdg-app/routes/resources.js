const express = require('express');
const { Resources } = require('../models');
const authenticate = require('../middleware/authenticate');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const resources = await Resources.findAll({ order: [['createdAt', 'DESC']] });
    return sendSuccess(res, 'Resources retrieved successfully', resources);
  } catch (error) {
    return sendError(res, 'Failed to retrieve resources');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const resource = await Resources.findByPk(req.params.id);

    if (!resource) {
      return sendError(res, 'Resource not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, 'Resource retrieved successfully', resource);
  } catch (error) {
    return sendError(res, 'Failed to retrieve resource');
  }
});

router.post('/', async (req, res) => {
  try {
    const resource = await Resources.create(req.body);
    return sendSuccess(res, 'Resource created successfully', resource, 201);
  } catch (error) {
    return sendError(res, 'Failed to create resource');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedCount] = await Resources.update(req.body, { where: { resource_id: req.params.id } });

    if (!updatedCount) {
      return sendError(res, 'Resource not found', 404, 'NOT_FOUND');
    }

    const resource = await Resources.findByPk(req.params.id);
    return sendSuccess(res, 'Resource updated successfully', resource);
  } catch (error) {
    return sendError(res, 'Failed to update resource');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Resources.destroy({ where: { resource_id: req.params.id } });

    if (!deleted) {
      return sendError(res, 'Resource not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, 'Resource deleted successfully', null);
  } catch (error) {
    return sendError(res, 'Failed to delete resource');
  }
});

module.exports = router;
