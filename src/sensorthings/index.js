const config = require('../config');

module.exports = {
  Client: require('./client')(config.get('sensorthingsEndpoint')),
  Cache: require('./cache'),
};

