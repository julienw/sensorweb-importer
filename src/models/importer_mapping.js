
module.exports = (sequelize, DataTypes) => {
  const ImporterMapping = sequelize.define('ImporterMapping', {
    provider: DataTypes.STRING,
    key: DataTypes.STRING,
    thingId: DataTypes.STRING,
  });

  return ImporterMapping;
};
