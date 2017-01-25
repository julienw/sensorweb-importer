const nock = require('nock');

const Lass = require('../src/lass');
const errors = require('../src/errors');

suite('Lass', function() {
  let lass;
  let server;
  const url = [ 'http://example.org', '/lass' ];

  setup(function() {
    lass = Lass({ url: url.join('') });
    server = nock(url[0])
      .defaultReplyHeaders({ 'content-type': 'application/json' })
      .get(url[1]);
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should return a standardized result', function*() {
    const oneSite = {
      SiteName: 'site name',
      Maker: 'maker',
      LatLng: { lng: 1, lat: 2 },
      Data: {
        PM25: 25,
        Create_at: '2017-01-24T13:00:00Z', // eslint-disable-line camelcase
        DataTime: '2017-01-24T13:00:00Z',
      },
    };

    const reply = server.reply(200, [ oneSite ]);

    const data = yield lass.fetch();
    assert.deepEqual(data, [{
      id: 'site name',
      name: 'site name',
      owner: 'maker',
      location: [1, 2],
      sensors: [{ name: 'PM25', value: 25 }],
      timestamp: new Date(Date.UTC(2017, 0, 24, 13)),
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
        name: 'not a json',
        body: 'some string',
      }
    ].forEach(({ name, body }) => {
      test(name, function*() {
        const reply = server.reply(200, body);

        yield assert.isRejected(lass.fetch(), errors.FetchError);
        reply.done();
      });
    });
  });
});
