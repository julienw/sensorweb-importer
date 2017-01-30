const nock = require('nock');

/**
 * @constructor
 * @param {[<String>, <String>]} baseUrlArray Array of 2 elements: first element
 * is the scheme and hostname part, second element is the base path, including
 * the first `/` but excluding the final `/`
 * @returns {SensorThingsMockServer}
 */
function SensorThingsMockServer(baseUrlArray) {
  this.basePath = baseUrlArray[1];
  this.server = nock(baseUrlArray[0])
    .defaultReplyHeaders({ 'content-type': 'application/json' });
}

SensorThingsMockServer.prototype = {
  setupForThing({ thingId }) {
    this.server = this.server
      .post(`${this.basePath}/Things`)
      .reply(201, (uri, body) => ({
        '@iot.id': thingId,
        '@iot.selfLink': `${this.basePath}/Things(${thingId})`,
        'Locations@iot.navigationLink':
          `${this.basePath}/Things(${thingId})/Locations`,
        'HistoricalLocations@iot.navigationLink':
          `${this.basePath}/Things(${thingId})/HistoricalLocations`,
        'Datastreams@iot.navigationLink':
          `${this.basePath}/Things(${thingId})/Datastreams`,
        description: body.description,
        name: body.name,
        properties: {
          owner: body.properties && body.properties.owner,
          organization: body.properties && body.properties.organization,
        },
      }));

    return this;
  },

  setupForLocation({ thingId, locationId }) {
    this.server = this.server
      .post(`${this.basePath}/Things(${thingId})/Locations`, {
        encodingType: 'application/vnd.geo+json',
        location: {
          type: 'Point',
          coordinates: [/./, /./],
        },
      })
      .reply(201, (uri, body) => ({
        '@iot.id': locationId,
        '@iot.selfLink': `${this.basePath}/Locations(${locationId})`,
        'Things@iot.navigationLink':
          `${this.basePath}/Locations(${locationId})/Things`,
        'HistoricalLocations@iot.navigationLink':
          `${this.basePath}/Locations(${locationId})/HistoricalLocations`,
        description: body.description,
        name: body.name,
        encodingType: body.encodingType,
        location: {
          type: body.location.type,
          coordinates: body.location.coordinates.slice(),
        },
      }));

    return this;
  },

  setupForObservedProperty({ propertyId }) {
    this.server = this.server
      .post(`${this.basePath}/ObservedProperties`)
      .reply(201, (uri, body) => ({
        '@iot.id': propertyId,
        '@iot.selfLink': `${this.basePath}/ObservedProperties(${propertyId})`,
        'Datastreams@iot.navigationLink':
           `${this.basePath}/ObservedProperties(${propertyId})/Datastreams`,
        name: body.name,
        description: body.description,
        definition: body.definition,
      }));

    return this;
  },

  setupForSensor({ sensorId }) {
    this.server = this.server
      .post(`${this.basePath}/Sensors`)
      .reply(201, (uri, body) => ({
        '@iot.id': sensorId,
        '@iot.selfLink': `${this.basePath}/Sensors(${sensorId})`,
        'Datastreams@iot.navigationLink':
          `${this.basePath}/Sensors(${sensorId})/Datastreams`,
        description: body.description,
        name: body.name,
        encodingType: body.encodingType,
        metadata: body.metadata,
      }));

    return this;
  },

  setupForDatastream({ streamId, thingId, propertyId, sensorId }) {
    this.server = this.server
      .post(`${this.basePath}/Datastreams`, {
        Thing: { '@iot.id': thingId },
        ObservedProperty: { '@iot.id': propertyId },
        Sensor: { '@iot.id': sensorId },
      })
      .reply(201, (uri, body) => ({
        '@iot.id': streamId,
        '@iot.selfLink': `${this.basePath}/Datastreams(${streamId})`,
        'Thing@iot.navigationLink':
          `${this.basePath}/Datastreams(${streamId})/Thing`,
        'Sensor@iot.navigationLink':
          `${this.basePath}/Datastreams(${streamId})/Sensor`,
        'ObservedProperty@iot.navigationLink':
          `${this.basePath}/Datastreams(${streamId})/ObservedProperty`,
        'Observations@iot.navigationLink':
          `${this.basePath}/Datastreams(${streamId})/Observations`,
        unitOfMeasurement: {
          name: body.unitOfMeasurement && body.unitOfMeasurement.name,
          symbol: body.unitOfMeasurement && body.unitOfMeasurement.symbol,
          definition:
            body.unitOfMeasurement && body.unitOfMeasurement.definition,
        },
        description: body.description,
        name: body.name,
        observedArea: null,
      }));

    return this;
  },

  setupForFeature({ featureId }) {
    this.server = this.server
      .post(`${this.basePath}/FeaturesOfInterest`, {
        encodingType: 'application/vnd.geo+json',
        feature: {
          type: 'Point',
          coordinates: [/./, /./],
        },
      })
      .reply(201, (uri, body) => ({
        '@iot.id': featureId,
        '@iot.selfLink': `${uri[1]}/FeaturesOfInterest(${featureId})`,
        'Observations@iot.navigationLink':
          `${uri[1]}/FeaturesOfInterest(${featureId})/Observations`,
        name: body.name,
        description: body.description,
        encodingType: body.encodingType,
        feature: {
          type: body.feature.type,
          coordinates: body.feature.coordinates.slice(),
        },
      }));

    return this;
  },

  setupForObservation({ observationId, streamId, featureId }) {
    this.server = this.server
      .post(`${this.basePath}/Observations`, {
        phenomenonTime: /./,
        resultTime: /./,
        Datastream: { '@iot.id': streamId },
        FeatureOfInterest: { '@iot.id': featureId },
        result: /\d/,
      })
      .reply(201, (uri, body) => ({
        '@iot.id': observationId,
        '@iot.selfLink': `${this.basePath}/Observations(${observationId})`,
        'Datastream@iot.navigationLink':
          `${this.basePath}/Observations(${observationId})/Datastream`,
        'FeatureOfInterest@iot.navigationLink':
          `${this.basePath}/Observations(${observationId})/FeaturesOfInterest`,
        phenomenonTime: body.phenomenonTime,
        resultTime: body.resultTime,
        result: body.result,
        parameters: null,
      }));

    return this;
  },

  teardown() {
    nock.cleanAll();
  },

  done() {
    this.server.done();
  }
};

module.exports = baseUrl => new SensorThingsMockServer(baseUrl);
