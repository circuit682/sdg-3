// app.js
const dotenv = require('dotenv');
const express = require('express');

const path = require('path');
const cors = require('cors');



dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the "assets" directory
app.use('/assets',express.static(path.join(__dirname, 'assets')));

// Route for the registration page
app.get('/register', (req, res) => {
  console.log(path.join(__dirname,'register.html'));
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
   
});

// Route for the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Import route files
const userRoutes = require('./routes/user');
const goalRoutes = require('./routes/goals');
const alcoholConsumptionRoutes = require('./routes/alcohol_consumption');
const consultationRoutes = require('./routes/consultations');
const resourceRoutes = require('./routes/resources');
const selfAssessmentRoutes = require('./routes/self_assesment');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const sequelize = require('./config/database');

// Set up routes
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/alcohol-consumption', alcoholConsumptionRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/self-assessment', selfAssessmentRoutes);
app.use('/dashboard', dashboardRoutes);

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));
// Server listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
