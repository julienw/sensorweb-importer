const co = require('co');
const debug = require('debug')('sensorweb-importer:sensorthings/cache');

const client = require('.').Client;
const dao = require('./dao');

module.exports = {
  createOrRetrieveThingAndFeature({ provider, thing, location, feature }) {
    return co(function*() {
      const thingInDb = yield dao.getThingAndFeature(provider, thing.key);
      if (thingInDb) {
        return {
          thingId: thingInDb.thingId,
          featureId: thingInDb.featureId,
        };
      }
      debug(`Thing ${thing.key} not found in DB, creating.`);

      const [ { thingId }, featureId ] = yield Promise.all([
        client.createThingWithLocation(thing.data, location),
        client.createFeatureOfInterest(feature)
      ]);
      yield dao.putThingAndFeature({
        provider,
        thingKey: thing.key,
        thingId,
        featureId,
      });
      return { thingId, featureId };
    });
  },

  createOrRetrieveDatastream(args) {
    const { provider, thingId, observedProperty, sensor, stream } = args;
    return co(function*() {
      const streamInDb = yield dao.getStream(provider, thingId, stream.name);
      if (streamInDb) {
        return streamInDb.streamId;
      }
      debug(`Stream ${stream.name} not found in DB, creating.`);

      const { streamId } = yield client.createFullDatastream(
        thingId, observedProperty, sensor, stream
      );
      yield dao.putStream({
        provider,
        streamName: stream.name,
        thingId,
        streamId
      });
      return streamId;
    });
  }
};
