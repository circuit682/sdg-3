const express = require('express');
const router = express.Router();
const { Self_Assessment } = require('../models');

// Get all self assessments
router.get('/', async (req, res) => {
  try {
    const assessments = await Self_Assessment.findAll();
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve assessments' });
  }
});

// Get a single self assessment by ID
router.get('/:id', async (req, res) => {
  try {
    const assessment = await Self_Assessment.findByPk(req.params.id);
    assessment ? res.json(assessment) : res.status(404).json({ error: 'Assessment not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve assessment' });
  }
});

// Create a new self assessment
router.post('/', async (req, res) => {
  try {
    const assessment = await Self_Assessment.create(req.body);
    res.status(201).json(assessment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Update a self assessment
router.put('/:id', async (req, res) => {
  try {
    const updated = await Self_Assessment.update(req.body, { where: { assessment_id: req.params.id } });
    updated ? res.json({ message: 'Assessment updated' }) : res.status(404).json({ error: 'Assessment not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update assessment' });
  }
});

// Delete a self assessment
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Self_Assessment.destroy({ where: { assessment_id: req.params.id } });
    deleted ? res.json({ message: 'Assessment deleted' }) : res.status(404).json({ error: 'Assessment not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

module.exports = router;
