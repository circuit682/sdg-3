module.exports = (sequelize, DataTypes) => {
  const Consultations = sequelize.define('Consultations', {
    consultation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    provider_name: DataTypes.STRING,
    notes: DataTypes.TEXT,
    recommendations: DataTypes.TEXT,
  });

  Consultations.associate = function(models) {
    // Consultations belongs to User
    Consultations.belongsTo(models.Users, { foreignKey: 'user_id' });
  };

  return Consultations;
};
