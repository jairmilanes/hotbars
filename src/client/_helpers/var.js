/**
 * Create a variable in the context for later use
 *
 * @param {string} key
 * @param {string} value
 * @param {object} options
 * @returns {(string|number|null|undefined)}
 */
module.exports.var = function (key, value, options) {
  if (!options && value) {
    options = value;
    value = undefined;
  }

  if (!value) {
    return options.data.local[key];
  }
  options.data.local[key] = value;
};
