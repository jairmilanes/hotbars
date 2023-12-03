/**
 * Comnvert a value to string
 *
 * @param {string} key
 * @param {string} value
 * @param {object} options
 * @returns {(string|number|null|undefined)}
 */
module.exports.toStr = function (value, options) {
  if (value === null || value === "undefined") return "";

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === "number") {
    return ""+value;
  }

  if (typeof value === "boolean") {
    return ""+value;
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return value;
};
