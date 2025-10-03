const express = require('express');
const router = express.Router();
const { Alcohol_Consumption } = require('../models');

// Get all alcohol consumption records
router.get('/', async (req, res) => {
  try {
    const records = await Alcohol_Consumption.findAll();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve records' });
  }
});

// Get a single alcohol consumption record by ID
router.get('/:id', async (req, res) => {
  try {
    const record = await Alcohol_Consumption.findByPk(req.params.id);
    record ? res.json(record) : res.status(404).json({ error: 'Record not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve record' });
  }
});

// Create a new alcohol consumption record
router.post('/', async (req, res) => {
  try {
    const record = await Alcohol_Consumption.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// Update an alcohol consumption record
router.put('/:id', async (req, res) => {
  try {
    const updated = await Alcohol_Consumption.update(req.body, { where: { consumption_id: req.params.id } });
    updated ? res.json({ message: 'Record updated' }) : res.status(404).json({ error: 'Record not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// Delete an alcohol consumption record
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Alcohol_Consumption.destroy({ where: { consumption_id: req.params.id } });
    deleted ? res.json({ message: 'Record deleted' }) : res.status(404).json({ error: 'Record not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;
