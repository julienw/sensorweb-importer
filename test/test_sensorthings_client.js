const Client = require('../src/sensorthings/client');
const sensorthingsMock = require('./sensorthings_mock_server');

suite('Sensorthings/Client', function() {
  let client;
  let server;
  const url = [ 'http://example.org', '/sensorthings' ];

  setup(function() {
    client = Client(url.join(''));
    server = sensorthingsMock(url);
  });

  teardown(function() {
    server.teardown();
  });

  suite('createThing', function() {
    setup(function() {
      server.setupForThing({ thingId: 1 });
    });

    test('POST to the sensorthing server', function*() {
      const id = yield client.createThing({
        description: 'description',
        name: 'name',
        properties: {
          owner: 'owner',
          organization: 'organization',
        },
      });
      server.done();
      assert.equal(id, 1);
    });
  });

  suite('createLocation', function() {
    setup(function() {
      server.setupForLocation({ locationId: 2, thingId: 1 });
    });

    test('POST to the sensorthing server', function*() {
      const id = yield client.createLocation(1, {
        description: 'description',
        name: 'name',
        encodingType: 'application/vnd.geo+json',
        location: {
          type: 'Point',
          coordinates: [-117.123, 54.123],
        },
      });
      server.done();
      assert.equal(id, 2);
    });
  });

  suite('createThingWithLocation', function() {
    setup(function() {
      server
        .setupForThing({ thingId: 1 })
        .setupForLocation({ locationId: 2, thingId: 1 });
    });

    test('POST to the sensorthing server', function*() {
      const thing = {
        description: 'description',
        name: 'name',
        properties: {
          owner: 'owner',
          organization: 'organization',
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
      const result = yield client.createThingWithLocation(thing, location);
      server.done();
      assert.deepEqual(result, { thingId: 1, locationId: 2 });
    });
  });

  suite('createObservedProperty', function() {
    setup(function() {
      server.setupForObservedProperty({ propertyId: 3 });
    });

    test('POST to the sensorthing server', function*() {
      const property = {
        name: 'PM 2.5',
        description: 'description',
        definition: 'definition',
      };

      const propertyId = yield client.createObservedProperty(property);
      server.done();
      assert.equal(propertyId, 3);
    });
  });

  suite('createSensor', function() {
    setup(function() {
      server.setupForSensor({ sensorId: 4 });
    });
    test('POST to the sensorthing server', function*() {
      const sensor = {
        description: 'description',
        name: 'name',
      };

      const sensorId = yield client.createSensor(sensor);
      server.done();
      assert.equal(sensorId, 4);
    });
  });

  suite('createDatastream', function() {
    setup(function() {
      server.setupForDatastream(
        { streamId: 5, thingId: 1, propertyId: 3, sensorId: 4 }
      );
    });

    test('POST to the sensorthing server', function*() {
      const stream = {
        description: 'description',
        name: 'name',
      };

      const streamId = yield client.createDatastream(1, 3, 4, stream);
      server.done();
      assert.equal(streamId, 5);
    });
  });

  suite('createFullDatastream', function() {
    setup(function() {
      server
        .setupForObservedProperty({ propertyId: 3 })
        .setupForSensor({ sensorId: 4 })
        .setupForDatastream(
          { streamId: 5, thingId: 1, propertyId: 3, sensorId: 4 }
        );
    });

    test('POST to the sensorthing server', function*() {
      const property = {
        name: 'PM 2.5',
        description: 'description',
        definition: 'definition',
      };
      const sensor = {
        description: 'description',
        name: 'name',
      };
      const stream = {
        description: 'description',
        name: 'name',
      };

      const result = yield client.createFullDatastream(
        1, property, sensor, stream
      );
      server.done();
      assert.deepEqual(result, { propertyId: 3, sensorId: 4, streamId: 5 });
    });
  });

  suite('createFeatureOfInterest', function() {
    setup(function() {
      server.setupForFeature({ featureId: 6 });
    });

    test('POST to the sensorthing server', function*() {
      const feature = {
        description: 'description',
        name: 'name',
        encodingType: 'application/vnd.geo+json',
        feature: {
          type: 'Point',
          coordinates: [-117.123, 54.123],
        },
      };

      const featureId = yield client.createFeatureOfInterest(feature);
      server.done();
      assert.equal(featureId, 6);
    });
  });

  suite('createObservation', function() {
    setup(function() {
      server.setupForObservation(
        { observationId: 7, featureId: 6, streamId: 5 }
      );
    });

    test('POST to the sensorthing server', function*() {
      const observation = {
        phenomenonTime: '2016-11-18T11:04:15.790Z',
        resultTime: '2016-11-18T11:04:15.790Z',
        result: 12.4,
      };

      const observationId = yield client.createObservation(5, 6, observation);
      server.done();
      assert.equal(observationId, 7);
    });
  });
});
