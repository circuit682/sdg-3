module.exports = (sequelize, DataTypes) => {
  const Goals = sequelize.define('Goals', {
    goal_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    end_date: DataTypes.DATE,
    status: DataTypes.STRING,
  });

  Goals.associate = function(models) {
    // Goals belongs to User
    Goals.belongsTo(models.Users, { foreignKey: 'user_id' });
  };

  return Goals;
};
