const express = require('express');
const router = express.Router();
const { Consultations } = require('../models');

// Get all consultations
router.get('/', async (req, res) => {
  try {
    const consultations = await Consultations.findAll();
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve consultations' });
  }
});

// Get a single consultation by ID
router.get('/:id', async (req, res) => {
  try {
    const consultation = await Consultations.findByPk(req.params.id);
    consultation ? res.json(consultation) : res.status(404).json({ error: 'Consultation not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve consultation' });
  }
});

// Create a new consultation
router.post('/', async (req, res) => {
  try {
    const consultation = await Consultations.create(req.body);
    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create consultation' });
  }
});

// Update a consultation
router.put('/:id', async (req, res) => {
  try {
    const updated = await Consultations.update(req.body, { where: { consultations_id: req.params.id } });
    updated ? res.json({ message: 'Consultation updated' }) : res.status(404).json({ error: 'Consultation not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update consultation' });
  }
});

// Delete a consultation
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Consultations.destroy({ where: { consultations_id: req.params.id } });
    deleted ? res.json({ message: 'Consultation deleted' }) : res.status(404).json({ error: 'Consultation not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete consultation' });
  }
});

module.exports = router;
