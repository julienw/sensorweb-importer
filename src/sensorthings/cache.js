const co = require('co');
const debug = require('debug')('sensorweb-importer:sensorthings/cache');

const client = require('.').Client;
const dao = require('./dao');

const PromiseCache = (function() {
  const thingCache = new Map();

  const ThingCache = {
    set({ provider, thingKey }, promise) {
      let providerMap = thingCache.get(provider);
      if (!providerMap) {
        providerMap = new Map();
        thingCache.set(provider, providerMap);
      }

      providerMap.set(thingKey, promise);
      return providerMap;
    },

    get({ provider, thingKey }) {
      const providerMap = thingCache.get(provider);
      return providerMap && providerMap.get(thingKey);
    },

    delete({ provider, thingKey }) {
      const providerMap = thingCache.get(provider);
      if (!providerMap) {
        return false;
      }

      /* Purposefully not deleting the thingCache entry even if providerMap is
       * empty, as it's possible we'll want to use it again, and we'll have only
       * very few of these objects over time. */
      return providerMap.delete(thingKey);
    }
  };

  const streamCache = new Map();

  const StreamCache = {
    set({ provider, thingKey }, promise) {
      let providerMap = thingCache.get(provider);
      if (!providerMap) {
        providerMap = new Map();
        thingCache.set(provider, providerMap);
      }

      providerMap.set(thingKey, promise);
      return providerMap;
    },

    get({ provider, thingKey }) {
      const providerMap = thingCache.get(provider);
      return providerMap && providerMap.get(thingKey);
    },

    delete({ provider, thingKey }) {
      const providerMap = thingCache.get(provider);
      if (!providerMap) {
        return false;
      }

      /* Purposefully not deleting the thingCache entry even if providerMap is
       * empty, as it's possible we'll want to use it again, and we'll have only
       * very few of these objects over time. */
      return providerMap.delete(thingKey);
    }
  };

  return {
    Thing: ThingCache,
    Stream: StreamCache,
  }
})();

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
