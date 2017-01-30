const db = require('../models');

module.exports = {
  getThingAndFeature(provider, thingKey) {
    return db().then(({ ImporterMappingThing }) =>
      ImporterMappingThing.findOne({
        where: { provider, thingKey },
        attributes: [ 'thingId', 'featureId' ],
      })
    );
  },

  getStream(provider, thingId, streamName) {
    return db().then(({ ImporterMappingStream }) =>
      ImporterMappingStream.findOne({
        where: { provider, streamName, thingId },
        attributes: [ 'streamId' ],
      })
    );
  },

  putThingAndFeature(values) {
    return db().then(({ ImporterMappingThing }) =>
      ImporterMappingThing.create(
        values,
        { fields: [ 'provider', 'thingKey', 'thingId', 'featureId' ] })
    );
  },

  putStream(values) {
    return db().then(({ ImporterMappingStream }) =>
      ImporterMappingStream.create(
        values,
        { fields: [ 'provider', 'streamName', 'thingId', 'streamId' ] })
    );
  }
};
