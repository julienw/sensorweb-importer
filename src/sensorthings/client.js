const fetch = require('node-fetch');

function SensorThingsClient(baseUrl) {
  this.baseUrl = baseUrl;
}

function createInSensorThings(url, body) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json())
    .then(json => json['@iot.id']);
}

SensorThingsClient.prototype = {
  createThing(thing) {
    return createInSensorThings(`${this.baseUrl}/Things`, thing);
  },

  createLocation(thingId, location) {
    return createInSensorThings(
      `${this.baseUrl}/Things(${thingId})/Locations`,
      location
    );
  },

  createThingWithLocation(thing, location) {
    return this.createThing(thing)
      .then(thingId =>
        this.createLocation(thingId, location)
          .then(locationId => ({ thingId, locationId }))
      );
  },

  createObservedProperty(property) {
    return createInSensorThings(`${this.baseUrl}/ObservedProperties`, property);
  },

  createSensor(sensor) {
    return createInSensorThings(`${this.baseUrl}/Sensors`, sensor);
  },

  createDatastream(thingId, propertyId, sensorId, stream) {
    const body = Object.assign({}, stream, {
      Thing: { '@iot.id': thingId },
      ObservedProperty: { '@iot.id': propertyId },
      Sensor: { '@iot.id': sensorId },
    });
    return createInSensorThings(`${this.baseUrl}/Datastreams`, body);
  },

  createFullDatastream(thingId, property, sensor, stream) {
    return Promise.all([
      this.createObservedProperty(property),
      this.createSensor(sensor)
    ]).then(([ propertyId, sensorId ]) =>
      this.createDatastream(thingId, propertyId, sensorId, stream)
        .then(streamId => ({ propertyId, sensorId, streamId }))
    );
  },

  createFeatureOfInterest(feature) {
    return createInSensorThings(`${this.baseUrl}/FeaturesOfInterest`, feature);
  },

  createObservation(streamId, featureId, observation) {
    const body = Object.assign({}, observation, {
      Datastream: { '@iot.id': streamId },
      FeatureOfInterest: { '@iot.id': featureId },
    });
    return createInSensorThings(`${this.baseUrl}/Observations`, body);
  }
};

module.exports = baseUrl => new SensorThingsClient(baseUrl);
