const fetch = require('node-fetch');

const { fetchError, FetchError } = require('../errors');

function LassDataImporter(config) {
  this.config = config;
}

LassDataImporter.prototype = {
  fetch() {
    return fetch(this.config.url)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          throw fetchError('The result should be an array.');
        }

        return data.map(site => {
          const thing = {
            id: site.SiteName,
            name: site.SiteName,
            owner: site.Maker,
            // longitude first in SensorThings
            location: [site.LatLng.lng, site.LatLng.lat],
            sensors: [],
            timestamp: new Date(site.Data.DataTime),
            rawSite: site,
          };
          for (const sensor in site.Data) {
            if (['Create_at', 'DataTime'].includes(sensor)) {
              continue;
            }

            thing.sensors.push({
              name: sensor,
              value: site.Data[sensor],
            });
          }

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

module.exports = (config) => new LassDataImporter(config);
