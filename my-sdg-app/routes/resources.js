const express = require('express');
const router = express.Router();
const { Resources } = require('../models');

// Get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resources.findAll();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve resources' });
  }
});

// Get a single resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resources.findByPk(req.params.id);
    resource ? res.json(resource) : res.status(404).json({ error: 'Resource not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve resource' });
  }
});

// Create a new resource
router.post('/', async (req, res) => {
  try {
    const resource = await Resources.create(req.body);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Update a resource
router.put('/:id', async (req, res) => {
  try {
    const updated = await Resources.update(req.body, { where: { resource_id: req.params.id } });
    updated ? res.json({ message: 'Resource updated' }) : res.status(404).json({ error: 'Resource not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Delete a resource
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Resources.destroy({ where: { resource_id: req.params.id } });
    deleted ? res.json({ message: 'Resource deleted' }) : res.status(404).json({ error: 'Resource not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

module.exports = router;
