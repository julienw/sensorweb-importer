const fetch = require('node-fetch');

const { fetchError, FetchError } = require('../errors');

const sensorNames =
  ['PM10', 'PM10_AVG', 'PM25', 'PM25_AVG', 'O3', 'O3_8', 'SO2', 'CO', 'NO2'];

function TaiwanEpaImporter(config) {
  this.config = config;
}

TaiwanEpaImporter.prototype = {
  fetch() {
    return fetch(this.config.url)
      .then(res => res.json())
      .then(data => {
        if (data.Result !== 'ok') {
          throw fetchError(`Got a result "${data.Result}" while fetching data`);
        }

        if (!Array.isArray(data.Data)) {
          throw fetchError('Data should be an array.');
        }

        return data.Data.map(site => {
          const thing = {
            id: site.SiteKey,
            name: site.SiteName,
            // longitude first in SensorThings
            location: [site.lng, site.lat],
            sensors: sensorNames
              .filter(name => site[name] !== undefined)
              .map(name => ({ name, value: site[name] })),
            timestamp: new Date(`${site.Time}+08:00`),
            rawSite: site,
          };

          return thing;
        });
      }).catch(e => {
        if (e instanceof FetchError) {
          throw e;
        }

        throw fetchError(`Error while fetching data: ${e.message}`);
      });
  }
};

module.exports = (config) => new TaiwanEpaImporter(config);
