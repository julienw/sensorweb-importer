if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

const chai = require('chai');
chai.use(require('chai-as-promised'));
global.assert = chai.assert;
