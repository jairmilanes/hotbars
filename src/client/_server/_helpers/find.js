/**
 * Create a variable in the context for later use
 *
 */
module.exports = function (key, value, array, options) {
  return array.find(item => item[key] === value)
};
