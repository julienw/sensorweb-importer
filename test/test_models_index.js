const db = require('../src/models');

suite('db', function() {
  teardown(function() {
    db.reset();
  });

  test('expose sequelize objects', function() {
    assert.property(db, 'sequelize');
    assert.property(db, 'Sequelize');
  });

  test('returns model objects', function*() {
    const models = yield db();
    assert.property(models, 'ImporterMappingThing');
    assert.property(models, 'ImporterMappingStream');
    assert.ok(models);
  });

  test('asking for db twice during initialization works', function*() {
    const dbs = yield Promise.all([db(), db()]);
    assert.ok(dbs[0]);
    assert.equal(dbs[0], dbs[1]);
  });

  test('asking for db twice after initialization works', function*() {
    const db1 = yield db();
    const db2 = yield db();
    assert.ok(db1);
    assert.equal(db1, db2);
  });
});
