
module.exports = (sequelize, DataTypes) => {
  const ImporterMappingStream = sequelize.define('ImporterMappingStream', {
    provider: { type: DataTypes.STRING, allowNull: false, unique: 'id' },
    thingId: { type: DataTypes.INTEGER, allowNull: false, unique: 'id' },
    streamName: { type: DataTypes.STRING, allowNull: false, unique: 'id' },
    streamId: { type: DataTypes.INTEGER, allowNull: false },
  });

  return ImporterMappingStream;
};
