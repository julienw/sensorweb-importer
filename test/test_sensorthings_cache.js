const cache = require('../src/sensorthings/cache');
const sensorthingsMock = require('./sensorthings_mock_server');
const db = require('../src/models');

suite('Sensorthings/Cache', function() {
  let server;

  const url = [ 'http://localhost:8080', '/v1.0' ];

  setup(function*() {
    const { ImporterMappingStream, ImporterMappingThing } = yield db();
    yield ImporterMappingThing.destroy({ where: {}});
    yield ImporterMappingStream.destroy({ where: {}});

    server = sensorthingsMock(url);
  });

  teardown(function() {
    server.teardown();
  });

  suite('createOrRetrieveThingAndFeature', function() {
    setup(function() {
      server
        .setupForThing({ thingId: 1 })
        .setupForFeature({ featureId: 3 })
        .setupForLocation({ thingId: 1, locationId: 2 });
    });

    test('works as expected with serialized calls', function*() {
      const provider = 'lass';

      const thing = {
        key: 'thingKey',
        data: {
          description: 'description',
          name: 'name',
          properties: {
            owner: 'owner',
            organization: 'organization',
          },
        },
      };

      const location = {
        description: 'description',
        name: 'name',
        encodingType: 'application/vnd.geo+json',
        location: {
          type: 'Point',
          coordinates: [-117.123, 54.123],
        },
      };

      const feature = {
        description: 'description',
        name: 'name',
        encodingType: 'application/vnd.geo+json',
        feature: {
          type: 'Point',
          coordinates: [-117.123, 54.123],
        },
      };

      const result1 = yield cache.createOrRetrieveThingAndFeature(
        { provider, thing, location, feature }
      );
      const result2 = yield cache.createOrRetrieveThingAndFeature(
        { provider, thing, location, feature }
      );
      assert.deepEqual(result2, result1);
      server.done();
    });

    test('registers 2 different things with serialized calls', function*() {
      server
        .setupForThing({ thingId: 8 })
        .setupForFeature({ featureId: 9 })
        .setupForLocation({ thingId: 8, locationId: 10 });

      const provider = 'lass';

      const thing = {
        key: 'thingKey',
        data: {
          description: 'description',
          name: 'name',
          properties: {
            owner: 'owner',
            organization: 'organization',
          },
        },
      };

      const location = {
        description: 'description',
        name: 'name',
        encodingType: 'application/vnd.geo+json',
        location: {
          type: 'Point',
          coordinates: [-117.123, 54.123],
        },
      };

      const feature = {
        description: 'description',
        name: 'name',
        encodingType: 'application/vnd.geo+json',
        feature: {
          type: 'Point',
          coordinates: [-117.123, 54.123],
        },
      };

      const result1 = yield cache.createOrRetrieveThingAndFeature(
        { provider, thing, location, feature }
      );

      thing.key = 'anotherKey';
      const result2 = yield cache.createOrRetrieveThingAndFeature(
        { provider, thing, location, feature }
      );
      assert.notDeepEqual(result2, result1);
      server.done();
    });
  });

  suite('createOrRetrieveDatastream', function() {
    setup(function() {
      server
        .setupForObservedProperty({ propertyId: 3 })
        .setupForSensor({ sensorId: 4 })
        .setupForDatastream(
          { streamId: 6, thingId: 1, propertyId: 3, sensorId: 4 }
        );
    });

    test('works as expected with serialized calls', function*() {
      const provider = 'lass';
      const thingId = 1;
      const observedProperty = { name: 'property' };
      const sensor = { name: 'sensor' };
      const stream = { name: 'stream' };

      const result1 = yield cache.createOrRetrieveDatastream(
        { provider, thingId, observedProperty, sensor, stream }
      );
      const result2 = yield cache.createOrRetrieveDatastream(
        { provider, thingId, observedProperty, sensor, stream }
      );
      assert.equal(result2, result1);
      server.done();
    });

    test('registers 2 different streams with serialized calls', function*() {
      server
        .setupForObservedProperty({ propertyId: 7 })
        .setupForSensor({ sensorId: 8 })
        .setupForDatastream(
          { streamId: 9, thingId: 2, propertyId: 7, sensorId: 8 }
        );

      const provider = 'lass';
      let thingId = 1;
      const observedProperty = { name: 'property' };
      const sensor = { name: 'sensor' };
      const stream = { name: 'stream' };

      const result1 = yield cache.createOrRetrieveDatastream(
        { provider, thingId, observedProperty, sensor, stream }
      );

      thingId = 2;
      stream.name = 'another_name';
      const result2 = yield cache.createOrRetrieveDatastream(
        { provider, thingId, observedProperty, sensor, stream }
      );
      assert.notEqual(result2, result1);
      server.done();
    });
  });
});
