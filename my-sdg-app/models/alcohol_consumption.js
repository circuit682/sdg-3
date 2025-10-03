module.exports = (sequelize, DataTypes) => {
  const Alcohol_Consumption = sequelize.define('Alcohol_Consumption', {
    consumption_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    time: DataTypes.TIME,
    amount: DataTypes.FLOAT,
    context: DataTypes.STRING,
  });

  Alcohol_Consumption.associate = function(models) {
    // Alcohol_Consumption belongs to User
    Alcohol_Consumption.belongsTo(models.Users, { foreignKey: 'user_id' });
  };

  return Alcohol_Consumption;
};
