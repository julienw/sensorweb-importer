const convict = require('convict');

convict.addFormat({
  name: 'dbport',
  validate: (val) => (val === null || val >= 0 && val <= 65535),
  coerce: (val) => (val === null ? null : parseInt(val))
});

const conf = convict({
  db: {
    host: {
      doc: 'Hostname where PostgreSQL is running',
      default: '/var/run/postgresql'
    },
    port: {
      doc: 'Port where PostgreSQL is running',
      format: 'dbport',
      default: null
    },
    name: {
      doc: 'Database name',
      default: 'sensorweb',
    },
    user: {
      doc: 'Database username',
      default: '',
    },
    password: {
      doc: 'Database password',
      default: '',
    }
  },
  delay_ms: { // eslint-disable-line camelcase
    doc: `Delay between retrievals. The delay is counted starting after the
          previous request.`,
    default: 15 * 60 * 1000 // default is 15 minutes
  },
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  providers: {},
  sensorthingsEndpoint: {
    doc: `This is the URL at the root of the sensorthings REST, where /Things
          is`,
    default: 'http://localhost:8080/v1.0/',
  }
});

conf.loadFile('./config/config.json');
try {
  // Trying to load a file that's specific to this mode
  conf.loadFile(`./config/${conf.get('env')}.json`);
} catch (e) {
  console.warn(`Warning: no specific config file for ${conf.get('env')} mode.`);
}

conf.validate();

module.exports = conf;
