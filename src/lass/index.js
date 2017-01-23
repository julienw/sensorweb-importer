const fetch = require('node-fetch');

function LassDataImporter(config) {
  this.config = config;
}

LassDataImporter.prototype = {
  fetch() {
    return fetch(this.config.url)
      .then(res => res.json())
      .then(data =>
        data.map(site => {
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
              data: site.Data[sensor],
            });
          }

          return thing;
        })
      );
  }
};

module.exports = (config) => new LassDataImporter(config);
