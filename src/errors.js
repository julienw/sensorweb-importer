
function FetchError(message) {
  this.message = message;
  this.name = 'FetchError';
  Error.captureStackTrace(this);
}

FetchError.prototype = Object.create(Error.prototype);

function fetchError(message) {
  return new FetchError(message);
}

module.exports = {
  fetchError,
  FetchError,
};
