const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { Users } = require('../models');


// Create a new user
router.post('/', async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the incoming request body for debugging

    // Ensure all required fields are present
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    console.log(Users); // Log the Users model for debugging
    const user = await Users.create({
      name,
      email,
      password: hashedPassword,
    });

    // Respond with success
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Error during registration:', error); // Log error details
    res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router;

// // Get all users
// router.get('/', async (req, res) => {
//   try {
//     const users = await Users.findAll();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to retrieve users' });
//   }
// });

// // Get a single user by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const user = await Users.findByPk(req.params.id);
//     user ? res.json(user) : res.status(404).json({ error: 'User not found' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to retrieve user' });
//   }
// });

// // Create a new user
// router.post('/', async (req, res) => {
//   try {
//     console.log('Request Body:', req.body); // Log the incoming request body for debugging
//     const { name, email, password } = req.body;

//     // Validate required fields
//     if (!name || !email || !password) {
//       return res.status(400).json({ error: 'Username, email, and password are required' });
//     }

//     // Hash the password before saving (if needed)
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create the user
//     console.log(Users); // Log the Users model for debugging
//     const user = await Users.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     res.status(201).json({ message: 'User registered successfully', user });
//   } catch (error) {
//     console.error('Error during registration:', error); // Log error details
//     res.status(500).json({ error: 'Failed to create user' });
//   }
// });

// // Update a user
// router.put('/:id', async (req, res) => {
//   try {
//     const updated = await Users.update(req.body, { where: { user_id: req.params.id } });
//     updated ? res.json({ message: 'User updated' }) : res.status(404).json({ error: 'User not found' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update user' });
//   }
// });

// // Delete a user
// router.delete('/:id', async (req, res) => {
//   try {
//     const deleted = await Users.destroy({ where: { user_id: req.params.id } });
//     deleted ? res.json({ message: 'User deleted' }) : res.status(404).json({ error: 'User not found' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete user' });
//   }
// });

