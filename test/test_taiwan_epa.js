const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;

const nock = require('nock');

const TaiwanEpa = require('../src/taiwan_epa');
const errors = require('../src/errors');

suite('TaiwanEpa', function() {
  let taiwanEpa;
  let server;
  const url = [ 'http://example.org', '/epa' ];

  setup(function() {
    taiwanEpa = TaiwanEpa({ url: url.join('') });
    server = nock(url[0])
      .defaultReplyHeaders({ 'content-type': 'application/json' })
      .get(url[1]);
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should return a standardized result', function*() {
    const oneSite = {
      SiteKey: 'site key',
      SiteName: 'site name',
      lng: 1,
      lat: 2,
      PM25: 25,
      Time: '2017-01-24T13:00:00',
    };

    const reply = server.reply(200, {
      Result: 'ok',
      Data: [ oneSite ],
    });

    const data = yield taiwanEpa.fetch();
    assert.deepEqual(data, [{
      id: 'site key',
      name: 'site name',
      location: [1, 2],
      sensors: [{ name: 'PM25', value: 25 }],
      timestamp: new Date(Date.UTC(2017, 0, 24, 5)),
      rawSite: oneSite,
    }]);

    reply.done();
  });

  suite('should be resistant at malformed results', function() {
    [
      {
        name: 'empty result',
        body: {},
      }, {
        name: 'Data is not an array',
        body: {
          Result: 'ok',
          Data: {},
        },
      }, {
        name: 'not a json',
        body: 'some string',
      }, {
        name: 'Result is not an object',
        body: [],
      }
    ].forEach(({ name, body }) => {
      test(name, function*() {
        const reply = server.reply(200, body);

        yield assert.isRejected(taiwanEpa.fetch(), errors.FetchError);
        reply.done();
      });
    });
  });
});
