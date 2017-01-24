const fetch = require('node-fetch');

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
          throw new Error(`Got a result "${data.Result}" while fetching data`);
        }

        return data.Data.map(site => {
          const thing = {
            id: site.SiteKey,
            name: site.SiteName,
            // longitude first in SensorThings
            location: [site.lng, site.lat],
            sensors: sensorNames.map(name => ({ name, value: site[name] })),
            timestamp: new Date(`${site.Time}+08:00`),
            rawSite: site,
          };

          return thing;
        });
      });
  }
};

module.exports = (config) => new TaiwanEpaImporter(config);
