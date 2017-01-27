const sinon = require('sinon');
const schedule = require('../src/scheduler');

suite('Scheduler', function() {
  let sandbox;

  setup(function() {
    sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers();
  });
  teardown(function() {
    sandbox.restore();
    schedule.reset();
  });

  test('Runs the function when needed', function*() {
    const returnedPromise = Promise.resolve();
    const stub = sinon.stub().returns(returnedPromise);
    const scheduled = schedule(stub, 1000);
    sinon.assert.notCalled(stub);
    sandbox.clock.tick();
    sinon.assert.calledOnce(stub);

    // second run
    stub.reset();
    yield returnedPromise;
    sandbox.clock.tick(999);
    sinon.assert.notCalled(stub);
    sandbox.clock.tick(1);
    sinon.assert.calledOnce(stub);

    // stopping
    stub.reset();
    yield returnedPromise;
    scheduled.stop();
    sandbox.clock.tick(10000);
    sinon.assert.notCalled(stub);
  });

  test('reset()', function*() {
    const returnedPromise = Promise.resolve();
    const stubs = [
      sinon.stub().returns(returnedPromise),
      sinon.stub().returns(returnedPromise),
      sinon.stub().returns(returnedPromise),
    ];

    stubs.forEach(stub => schedule(stub, 1000));
    sandbox.clock.tick();
    stubs.forEach(stub => { sinon.assert.called(stub); stub.reset(); });

    yield returnedPromise;
    schedule.reset();
    sandbox.clock.tick(1000);
    stubs.forEach(stub => sinon.assert.notCalled(stub));
  });
});
