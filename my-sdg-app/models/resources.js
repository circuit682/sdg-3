module.exports = (sequelize, DataTypes) => {
  const Resources = sequelize.define('Resources', {
    resource_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    link: DataTypes.STRING,
  });

  // No association in the ERD, Resources is stand-alone
  return Resources;
};
