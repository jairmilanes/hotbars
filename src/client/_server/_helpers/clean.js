/**
 * Removes extra white spaces
 *
 * @param {object} options
 * @returns {(string)}
 */
module.exports = function (options) {
  return options.fn(this).replace(/\s+/g, " ").trim();
};
