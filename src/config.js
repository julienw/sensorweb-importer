const convict = require('convict');

const conf = convict({
  modules: {}
});

conf.loadFile('config/config.json');

module.exports = conf;
