process.env.DEBUG_FD = 1; // debug() echoes to stdout instead of stderr

const debug = require('debug')('sensorweb-importer:index');
const config = require('./config');
const sensorthingsClient =
  require('./sensorthings_client')(config.get('sensorthingsEndpoint'));
const schedule = require('./scheduler');

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
        name: site.name,
        properties: {
          owner: site.owner,
          source: sourceName,
        }
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

      return Promise.all([
        sensorthingsClient.createThingWithLocation(thing, location),
        sensorthingsClient.createFeatureOfInterest(featureOfInterest)
      ]).then(([ { thingId }, featureId ]) =>
        Promise.all(observations.map(observation => {
          const { observedProperty, sensor, stream } = observation;
          return sensorthingsClient.createFullDatastream(
            thingId, observedProperty, sensor, stream
          ).then(({ streamId }) =>
            sensorthingsClient.createObservation(
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
