const express = require('express');
const router = express.Router();
const { Goals } = require('../models');

// Get all goals
router.get('/', async (req, res) => {
  try {
    const goals = await Goals.findAll();
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve goals' });
  }
});

// Get a single goal by ID
router.get('/:id', async (req, res) => {
  try {
    const goal = await Goals.findByPk(req.params.id);
    goal ? res.json(goal) : res.status(404).json({ error: 'Goal not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve goal' });
  }
});

// Create a new goal
router.post('/', async (req, res) => {
  try {
    const goal = await Goals.create(req.body);
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update a goal
router.put('/:id', async (req, res) => {
  try {
    const updated = await Goals.update(req.body, { where: { goal_id: req.params.id } });
    updated ? res.json({ message: 'Goal updated' }) : res.status(404).json({ error: 'Goal not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Delete a goal
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Goals.destroy({ where: { goal_id: req.params.id } });
    deleted ? res.json({ message: 'Goal deleted' }) : res.status(404).json({ error: 'Goal not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

module.exports = router;
