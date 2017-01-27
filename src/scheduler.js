/**
 * Schedule the execution of a task. The task is a function that returns a
 * promise. It will be run right now first (after a small delay) and then
 * <delay_ms> ms after the last time the returned promise was fulfilled.
 *
 * @param {Function} task A function that returns a promise.
 * @param {Integer} delayMs Delay between invocations, in ms.
 * @returns {Object} Returns an object with a `stop` method to stop the
 * scheduling.
 */

const timeoutMap = new Map();

module.exports = function schedule(task, delayMs) {
  function setTimeoutId(timeoutId) {
    timeoutMap.set(task, timeoutId);
  }

  function runTask() {
    task().then(
      () => setTimeoutId(setTimeout(runTask, delayMs))
    );
  }

  setTimeoutId(setTimeout(runTask));
  return {
    stop() {
      clearTimeout(timeoutMap.get(task));
      timeoutMap.delete(task);
    },
  };
};

module.exports.reset = function reset() {
  for (const [, timeoutId] of timeoutMap) {
    clearTimeout(timeoutId);
  }
  timeoutMap.clear();
};
