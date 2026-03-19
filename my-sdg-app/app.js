// app.js
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/login.html', (req, res) => {
  res.redirect('/login');
});

app.get('/register.html', (req, res) => {
  res.redirect('/register');
});

app.get('/welcome', (req, res) => {
  res.redirect('/');
});

const userRoutes = require('./routes/user');
const goalRoutes = require('./routes/goals');
const alcoholConsumptionRoutes = require('./routes/alcohol_consumption');
const consultationRoutes = require('./routes/consultations');
const resourceRoutes = require('./routes/resources');
const selfAssessmentRoutes = require('./routes/self_assesment');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const sequelize = require('./config/database');

app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/alcohol-consumption', alcoholConsumptionRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/self-assessment', selfAssessmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch((err) => console.log(`Error: ${err}`));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
