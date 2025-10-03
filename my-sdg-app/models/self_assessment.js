module.exports = (sequelize, DataTypes) => {
  const Self_Assessment = sequelize.define('Self_Assessment', {
    assessment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    risk_level: DataTypes.STRING,
    scores: DataTypes.INTEGER,
    notes: DataTypes.TEXT,
  });

  Self_Assessment.associate = function(models) {
    // Self_Assessment belongs to User
    Self_Assessment.belongsTo(models.Users, { foreignKey: 'user_id' });
  };

  return Self_Assessment;
};
