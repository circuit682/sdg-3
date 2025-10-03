module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING, 
    age: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    role: DataTypes.STRING,
  });

  Users.associate = function(models) {
    // Users has many Goals, Self_Assessments, Consultations, and Alcohol_Consumptions
    Users.hasMany(models.Goals, { foreignKey: 'user_id' });
    Users.hasMany(models.Self_Assessment, { foreignKey: 'user_id' });
    Users.hasMany(models.Consultations, { foreignKey: 'user_id' });
    Users.hasMany(models.Alcohol_Consumption, { foreignKey: 'user_id' });
  };

  return Users;
};
