
function FetchError(message) {
  Error.call(this, message);
  this.name = 'FetchError';
}

FetchError.prototype = Object.create(Error.prototype);

function fetchError(message) {
  return new FetchError(message);
}

module.exports = {
  fetchError,
  FetchError,
};
