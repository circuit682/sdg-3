// models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');  // Import the sequelize instance from config/database.js
// const { Users } = require('./user');  // Import the Users model
// Import the Users model
const Users = require('./user')(sequelize, Sequelize.DataTypes); 
console.log(Users); // Log Users model to ensure it's being correctly imported

const { Goals } = require('./goals');  // Import the Goals model
const { Self_Assessment } = require('./self_assessment');  // Import the Self_Assessment model
const { Alcohol_Consumption } = require('./alcohol_consumption');  // Import the Alcohol_Consumption model
const { Consultations } = require('./consultations');  // Import the Consultations model
const { Resources } = require('./resources');  // Import the Resources model


// Sync models with database (if you want to auto-sync)
sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch((err) => console.log('Error syncing database:', err));

module.exports = {
  sequelize,
  Users,
  // Add other models here (e.g., Goals, Self_Assessment, etc.)
    Goals,
    Self_Assessment,
    Alcohol_Consumption,
    Consultations,
    Resources
    
};
