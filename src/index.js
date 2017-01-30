process.env.DEBUG_FD = 1; // debug() echoes to stdout instead of stderr

const debug = require('debug')('sensorweb-importer:index');
const config = require('./config');
const schedule = require('./scheduler');
const Sensorthings = require('./sensorthings');

const providers = config.get('providers')
  .map(({ name, url }) => ({
    name,
    url,
    provider: require(`./${name}`)({ url }),
  }));

function handleDataFrom(sourceName) {
  return (data) => {
    data.forEach(site => {
      const thing = {
        data: {
          name: site.name,
          properties: {
            owner: site.owner,
            source: sourceName,
          },
        },
        key: site.id,
      };

      const location = {
        name: site.name,
        encodingType: 'application/vnd.geo+json',
        location: {
          type: 'Point',
          coordinates: site.location,
        },
      };

      const featureOfInterest = {
        name: site.name,
        encodingType: 'application/vnd.geo+json',
        feature: {
          type: 'Point',
          coordinates: site.location,
        },
      };

      const observations = site.sensors
        .map(({ name, value }) => {
          const observedProperty = { name };
          const sensor = { name };
          const stream = { name };
          return {
            observedProperty,
            sensor,
            stream,
            result: parseFloat(value),
            resultTime: site.timestamp.toString(),
            phenomenonTime: site.timestamp.toString(),
          };
        })
        .filter(({ value }) => !isNaN(value));

      return Sensorthings.Cache.createOrRetrieveThingAndFeature({
        provider: sourceName,
        thing,
        location,
        feature: featureOfInterest,
      }).then(({ thingId, featureId }) =>
        Promise.all(observations.map(observation => {
          const { observedProperty, sensor, stream } = observation;
          return Sensorthings.Cache.createOrRetrieveDatastream({
            provider: sourceName,
            thingId,
            observedProperty,
            sensor,
            stream
          }).then(({ streamId }) =>
            Sensorthings.Client.createObservation(
              streamId, featureId, observation
            )
          );
        }))
      );
    });
  };
}

for (const { name, provider } of providers) {
  schedule(
    () => {
      debug(`Fetching data for ${name}`);
      return provider.fetch().then(handleDataFrom(name));
    },
    config.get('delay_ms')
  );
}
