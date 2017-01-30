
module.exports = (sequelize, DataTypes) => {
  const ImporterMappingThing = sequelize.define('ImporterMappingThing', {
    provider: { type: DataTypes.STRING, allowNull: false, unique: 'id' },
    thingKey: { type: DataTypes.STRING, allowNull: false, unique: 'id' },
    thingId: { type: DataTypes.INTEGER, allowNull: false },
    featureId: { type: DataTypes.INTEGER, allowNull: false },
  });

  return ImporterMappingThing;
};
